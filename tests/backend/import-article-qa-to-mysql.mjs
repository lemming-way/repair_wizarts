#!/usr/bin/env node
import mysql from 'mysql2/promise';
import { findZipFiles, readArticleZip } from '../../scripts/article-importer.mjs';

const required = ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD'];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) throw new Error('Missing required MySQL secrets: ' + missing.join(', '));

const fixtures = findZipFiles('docs').map(readArticleZip);
const source = fixtures.find((item) => item.slug === 'electric_kettle');
if (!source) throw new Error('electric_kettle ZIP fixture not found.');

const article = structuredClone(source.article);
article.title = 'Проверка реального импорта: электрический чайник не включается [QA 2026-11-07]';
article.media_base_url = '/articles/electric_kettle/';

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
  const [[identity]] = await db.query(
    'SELECT DATABASE() AS db, @@hostname AS host, @@read_only AS read_only'
  );
  if (identity.db !== process.env.MYSQL_DATABASE || Number(identity.read_only) !== 0) {
    throw new Error('Refusing write: database identity/read-only check failed: ' + JSON.stringify(identity));
  }

  const [columnsRows] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='blog_post'"
  );
  const columns = new Set(columnsRows.map((row) => row.COLUMN_NAME));
  const requiredColumns = [
    'id_blog_post', 'id_blog_topic', 'id_user', 'name', 'value',
    'last_edit_datetime', 'last_edit_user', 'create_datetime',
  ];
  for (const column of requiredColumns) {
    if (!columns.has(column)) throw new Error('Missing blog_post column: ' + column);
  }
  const publicationColumns = [
    'status', 'blog_status', 'id_blog_status', 'status_id', 'id_status', 'is_published', 'published',
  ].filter((column) => columns.has(column));
  if (publicationColumns.length) {
    throw new Error('Unexpected publication columns; refusing unmapped write: ' + publicationColumns.join(', '));
  }

  const [topics] = await db.execute(
    'SELECT id_blog_topic FROM blog_topic WHERE name=? ORDER BY id_blog_topic',
    [article.topic.name]
  );
  if (topics.length !== 1) {
    throw new Error('Expected exactly one topic named "' + article.topic.name + '", found ' + topics.length);
  }
  const [[user]] = await db.query('SELECT id_user FROM users ORDER BY id_user LIMIT 1');
  if (!user) throw new Error('No existing user found.');

  const topicId = Number(topics[0].id_blog_topic);
  const qaTitle = article.title;
  await db.beginTransaction();
  const [existing] = await db.execute(
    'SELECT id_blog_post FROM blog_post WHERE id_blog_topic=? AND name=? ORDER BY id_blog_post FOR UPDATE',
    [topicId, qaTitle]
  );

  let id;
  let action;
  if (existing.length) {
    id = Number(existing[0].id_blog_post);
    action = 'already_exists';
  } else {
    const now = new Date();
    const [inserted] = await db.execute(
      'INSERT INTO blog_post (id_blog_topic,id_user,name,value,last_edit_datetime,last_edit_user,create_datetime) VALUES (?,?,?,?,?,?,?)',
      [topicId, Number(user.id_user), qaTitle, JSON.stringify(article), now, Number(user.id_user), now]
    );
    id = Number(inserted.insertId);
    action = 'inserted';
  }
  await db.commit();

  const [[saved]] = await db.execute(
    'SELECT id_blog_post,id_blog_topic,id_user,name,JSON_VALID(value) AS valid_json,' +
    "JSON_UNQUOTE(JSON_EXTRACT(value,'$.format_version')) AS format_version," +
    "JSON_UNQUOTE(JSON_EXTRACT(value,'$.media_base_url')) AS media_base_url " +
    'FROM blog_post WHERE id_blog_post=?',
    [id]
  );
  if (!saved || Number(saved.valid_json) !== 1 || saved.format_version !== '1.3' ||
      saved.name !== qaTitle || saved.media_base_url !== article.media_base_url) {
    throw new Error('Committed article readback validation failed: ' + JSON.stringify(saved));
  }

  console.log('PRODUCTION_DB_IDENTITY ' + JSON.stringify(identity));
  console.log('QA_ARTICLE_RESULT ' + JSON.stringify({
    action, id, topic_id: topicId, title: saved.name,
    format_version: saved.format_version, media_base_url: saved.media_base_url,
    publication: 'blog_post has no publication-status column; current public query does not filter these rows',
  }));
  console.log('QA_ARTICLE_READBACK_OK');
} catch (error) {
  await db.rollback().catch(() => {});
  throw error;
} finally {
  await db.end();
}
