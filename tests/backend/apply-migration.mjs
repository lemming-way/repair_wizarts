#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';

const required = ['REPAIR_DB_HOST','REPAIR_DB_PORT','REPAIR_DB_NAME','REPAIR_DB_USER','REPAIR_DB_PASSWORD','REPAIR_DB_ENVIRONMENT'];
for (const key of required) if (!process.env[key]) throw new Error('Missing required secret/environment value: '+key);
if (process.env.REPAIR_DB_ENVIRONMENT !== 'test') throw new Error('Refusing to run: REPAIR_DB_ENVIRONMENT must equal "test".');
if (!/^[A-Za-z0-9_$-]+$/.test(process.env.REPAIR_DB_NAME)) throw new Error('Invalid database name.');
if (!/^\d+$/.test(process.env.REPAIR_DB_PORT)) throw new Error('Invalid database port.');

const migrations = new Map([
  ['blog_comment', 'sql/blog_comment.sql'],
]);
const selected = process.env.REPAIR_MIGRATION;
if (!migrations.has(selected)) throw new Error('Migration is not allowlisted: '+String(selected));
const migrationPath = migrations.get(selected);
const sql = fs.readFileSync(migrationPath, 'utf8').trim();
if (!sql || !/^CREATE TABLE `blog_comment`\s*\(/i.test(sql) || (sql.match(/;/g) || []).length > 1) {
  throw new Error('Migration file failed the expected single-statement safety check.');
}
const checksum = crypto.createHash('sha256').update(sql).digest('hex');

const connection = await mysql.createConnection({
  host: process.env.REPAIR_DB_HOST,
  port: Number(process.env.REPAIR_DB_PORT),
  user: process.env.REPAIR_DB_USER,
  password: process.env.REPAIR_DB_PASSWORD,
  database: process.env.REPAIR_DB_NAME,
  connectTimeout: 15000,
  multipleStatements: false,
});
try {
  const [[identity]] = await connection.query('SELECT DATABASE() AS db, @@hostname AS host, @@read_only AS read_only');
  console.log('Connected database: '+identity.db);
  console.log('Database server: '+identity.host);
  if (identity.db !== process.env.REPAIR_DB_NAME) throw new Error('Connected database does not match REPAIR_DB_NAME.');
  if (Number(identity.read_only) === 1) throw new Error('Database server is read-only.');

  const [deps] = await connection.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('blog_post','users','blog_comment')"
  );
  const existing = new Set(deps.map(row => row.TABLE_NAME));
  for (const table of ['blog_post','users']) if (!existing.has(table)) throw new Error('Required dependency table is missing: '+table);

  const [postCols] = await connection.query(
    "SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='blog_post' AND COLUMN_NAME='id_blog_post'"
  );
  const [userCols] = await connection.query(
    "SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='id_user'"
  );
  if (postCols.length !== 1 || postCols[0].COLUMN_KEY !== 'PRI' || !/^int\b/i.test(postCols[0].COLUMN_TYPE)) throw new Error('blog_post.id_blog_post is not the expected INT primary key.');
  if (userCols.length !== 1 || userCols[0].COLUMN_KEY !== 'PRI' || !/^int\b/i.test(userCols[0].COLUMN_TYPE)) throw new Error('users.id_user is not the expected INT primary key.');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      migration VARCHAR(190) NOT NULL PRIMARY KEY,
      checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  const [applied] = await connection.execute('SELECT checksum FROM schema_migrations WHERE migration = ?', [selected]);
  if (applied.length) {
    if (applied[0].checksum !== checksum) throw new Error('Migration checksum differs from the already-applied version. Manual review required.');
    console.log('Already applied with matching checksum; no changes made.');
  } else {
    if (existing.has('blog_comment')) throw new Error('blog_comment already exists but is not recorded in schema_migrations; refusing to assume its schema.');
    console.log('Applying allowlisted migration: '+migrationPath);
    await connection.query(sql);
    const [created] = await connection.query(
      "SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='blog_comment'"
    );
    if (Number(created[0].n) !== 1) throw new Error('Post-migration verification failed: blog_comment not found.');
    await connection.execute('INSERT INTO schema_migrations (migration, checksum) VALUES (?, ?)', [selected, checksum]);
    console.log('Migration applied and recorded: '+selected);
  }

  const [verify] = await connection.query(
    "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='blog_comment' ORDER BY ORDINAL_POSITION"
  );
  console.log('blog_comment columns verified: '+verify.map(c => c.COLUMN_NAME).join(', '));
  if (verify.length !== 9) throw new Error('Unexpected blog_comment column count: '+verify.length);
  console.log('PASS');
} finally {
  await connection.end();
}
