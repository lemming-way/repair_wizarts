#!/usr/bin/env node
import mysql from 'mysql2/promise';
import { findZipFiles, readArticleZip } from '../../scripts/article-importer.mjs';

const required = ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD'];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) throw new Error('Missing required MySQL secrets: ' + missing.join(', '));

const expectedSlugs = new Set([
  'smartphone', 'electric_kettle', 'toilet_cistern',
  'bicycle_brakes', 'laptop_overheating', 'washing_machine_drain',
]);
const zipFiles = findZipFiles('docs');
const imported = zipFiles.map(readArticleZip);
const foundSlugs = new Set(imported.map((item) => item.slug));
const missingSlugs = [...expectedSlugs].filter((slug) => !foundSlugs.has(slug));
const unexpectedSlugs = [...foundSlugs].filter((slug) => !expectedSlugs.has(slug));
if (missingSlugs.length || unexpectedSlugs.length || imported.length !== expectedSlugs.size) {
  throw new Error('ZIP inventory mismatch: ' + JSON.stringify({ missingSlugs, unexpectedSlugs, count: imported.length }));
}
const names = new Set();
for (const item of imported) {
  if (names.has(item.article.title)) throw new Error('Duplicate article title: ' + item.article.title);
  names.add(item.article.title);
  item.article.media_base_url = '/articles/' + item.slug + '/';
}

const db = await mysql.createConnection({
  host: process.env.MYSQL_HOST.trim(),
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectTimeout: 15000,
  multipleStatements: false,
  ...(process.env.MYSQL_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
});

try {
  const [[identity]] = await db.query('SELECT DATABASE() AS db, @@hostname AS host, @@read_only AS read_only');
  if (identity.db !== process.env.MYSQL_DATABASE || Number(identity.read_only) !== 0) {
    throw new Error('Refusing write: database identity/read-only check failed: ' + JSON.stringify(identity));
  }

  const [postColumns] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='blog_post'"
  );
  const columns = new Set(postColumns.map((row) => row.COLUMN_NAME));
  const requiredColumns = ['id_blog_post','id_blog_topic','id_user','name','value','last_edit_datetime','last_edit_user','create_datetime'];
  for (const column of requiredColumns) if (!columns.has(column)) throw new Error('Missing blog_post column: ' + column);
  const statusColumns = ['status','blog_status','id_blog_status','status_id','id_status','is_published','published'];
  const presentStatus = statusColumns.filter((column) => columns.has(column));
  if (presentStatus.length) {
    throw new Error('Unexpected publication column(s) require explicit status mapping before import: ' + presentStatus.join(', '));
  }

  const [[user]] = await db.query('SELECT id_user FROM users ORDER BY id_user LIMIT 1');
  if (!user) throw new Error('No existing user found in users.');
  const [topics] = await db.query('SELECT id_blog_topic, name FROM blog_topic');
  const topicIds = new Map(topics.map((row) => [row.name, Number(row.id_blog_topic)]));
  for (const item of imported) {
    if (!topicIds.has(item.article.topic.name)) throw new Error('Topic not found: ' + item.article.topic.name);
  }

  await db.beginTransaction();
  const writes = [];
  for (const item of imported) {
    const topicId = topicIds.get(item.article.topic.name);
    const [existing] = await db.execute(
      'SELECT id_blog_post FROM blog_post WHERE id_blog_topic=? AND name=? ORDER BY id_blog_post LIMIT 1',
      [topicId, item.article.title]
    );
    if (existing.length) {
      writes.push({ slug: item.slug, title: item.article.title, id: Number(existing[0].id_blog_post), action: 'already_exists' });
      continue;
    }
    const content = JSON.stringify(item.article);
    const now = new Date();
    const [result] = await db.execute(
      'INSERT INTO blog_post (id_blog_topic,id_user,name,value,last_edit_datetime,last_edit_user,create_datetime) VALUES (?,?,?,?,?,?,?)',
      [topicId, Number(user.id_user), item.article.title, content, now, Number(user.id_user), now]
    );
    writes.push({ slug: item.slug, title: item.article.title, id: Number(result.insertId), action: 'inserted' });
  }
  await db.commit();

  const ids = writes.map((row) => row.id);
  const [readback] = await db.query(
    'SELECT id_blog_post,id_blog_topic,id_user,name,JSON_VALID(value) AS valid_json,JSON_UNQUOTE(JSON_EXTRACT(value, "$.format_version")) AS format_version,JSON_UNQUOTE(JSON_EXTRACT(value, "$.media_base_url")) AS media_base_url FROM blog_post WHERE id_blog_post IN (' + ids.map(() => '?').join(',') + ') ORDER BY id_blog_post',
    ids
  );
  if (readback.length !== imported.length || readback.some((row) => Number(row.valid_json) !== 1 || row.format_version !== '1.3')) {
    throw new Error('Readback validation failed: ' + JSON.stringify(readback));
  }
  console.log('DB_IDENTITY ' + JSON.stringify(identity));
  console.log('USING_EXISTING_USER_ID ' + Number(user.id_user));
  console.log('ARTICLE_WRITE_RESULTS ' + JSON.stringify(writes));
  console.log('ARTICLE_READBACK ' + JSON.stringify(readback));
  console.log('PUBLICATION_MODE no publication/status column exists; current API has no status filter, so imported rows are returned by the current public listing query.');
} catch (error) {
  await db.rollback().catch(() => {});
  throw error;
} finally {
  await db.end();
}
