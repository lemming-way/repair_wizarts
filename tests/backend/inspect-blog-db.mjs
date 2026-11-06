#!/usr/bin/env node
import mysql from 'mysql2/promise';

const required = ['REPAIR_DB_HOST','REPAIR_DB_PORT','REPAIR_DB_NAME','REPAIR_DB_USER','REPAIR_DB_PASSWORD','REPAIR_DB_ENVIRONMENT'];
for (const key of required) if (!process.env[key]) throw new Error('Missing DB environment value: ' + key);
if (process.env.REPAIR_DB_ENVIRONMENT !== 'test') throw new Error('Refusing DB inspection unless REPAIR_DB_ENVIRONMENT=test');
if (!/^\d+$/.test(process.env.REPAIR_DB_PORT)) throw new Error('Invalid DB port');

const db = await mysql.createConnection({
  host: process.env.REPAIR_DB_HOST, port: Number(process.env.REPAIR_DB_PORT),
  user: process.env.REPAIR_DB_USER, password: process.env.REPAIR_DB_PASSWORD,
  database: process.env.REPAIR_DB_NAME, connectTimeout: 15000, multipleStatements: false,
});
try {
  const [[identity]] = await db.query('SELECT DATABASE() AS db, @@hostname AS host, @@read_only AS read_only');
  if (identity.db !== process.env.REPAIR_DB_NAME) throw new Error('Database identity mismatch');
  console.log('DB identity: ' + JSON.stringify(identity));
  for (const table of ['blog_post','blog_topic','users']) {
    const [exists] = await db.execute(
      'SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?',[table]
    );
    if (!Number(exists[0].n)) throw new Error('Required table missing: ' + table);
    const [columns] = await db.execute(
      'SELECT COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_DEFAULT,COLUMN_KEY,EXTRA FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION',[table]
    );
    console.log('TABLE ' + table + ' COLUMNS ' + JSON.stringify(columns));
  }
  const [postCounts] = await db.query('SELECT COUNT(*) AS total FROM blog_post');
  console.log('BLOG_POST_TOTAL ' + postCounts[0].total);
  const [topicRows] = await db.query('SELECT * FROM blog_topic ORDER BY id_blog_topic LIMIT 100');
  console.log('BLOG_TOPIC_ROWS ' + JSON.stringify(topicRows));
  const [statusColumns] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='blog_post' AND COLUMN_NAME IN ('status','blog_status','id_blog_status','status_id','id_status','is_published','published')"
  );
  for (const col of statusColumns) {
    const name = col.COLUMN_NAME;
    const [rows] = await db.query('SELECT ' + name + ' AS status_value,COUNT(*) AS n FROM blog_post GROUP BY ' + name + ' ORDER BY n DESC');
    console.log('BLOG_POST_STATUS ' + name + ' ' + JSON.stringify(rows));
  }
  const [users] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME IN ('id_user','role','id_role','user_role','deleted','active')"
  );
  const userFields = new Set(users.map(x=>x.COLUMN_NAME));
  if (!userFields.has('id_user')) throw new Error('users.id_user missing');
  const select = ['id_user', ...['role','id_role','user_role','deleted','active'].filter(x=>userFields.has(x))].join(',');
  const [userRows] = await db.query('SELECT ' + select + ' FROM users ORDER BY id_user LIMIT 20');
  console.log('USER_SAMPLE_NON_PERSONAL ' + JSON.stringify(userRows));
  const [userCounts] = await db.query('SELECT COUNT(*) AS total FROM users' + (userFields.has('deleted') ? ' WHERE deleted=0' : ''));
  console.log('ACTIVE_USER_COUNT ' + userCounts[0].total);
} finally {
  await db.end();
}
