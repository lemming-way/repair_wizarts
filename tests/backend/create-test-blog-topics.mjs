#!/usr/bin/env node
import mysql from 'mysql2/promise';
import { readArticleZip } from '../../scripts/article-importer.mjs';

const required = ['MYSQL_HOST','MYSQL_PORT','MYSQL_DATABASE','MYSQL_USER','MYSQL_PASSWORD'];
for (const key of required) if (!process.env[key]) throw new Error('Missing DB environment value: ' + key);
if (!/^\d+$/.test(process.env.MYSQL_PORT)) throw new Error('Invalid MySQL port');

const zipPaths = [
  'docs/regression/v1.3/smartphone.zip',
  'docs/regression/v1.3/electric_kettle.zip',
  'docs/regression/v1.3/toilet_cistern.zip',
  'docs/regression/assistant-authored/v1.3/bicycle_brakes.zip',
  'docs/regression/assistant-authored/v1.3/laptop_overheating.zip',
  'docs/regression/assistant-authored/v1.3/washing_machine_drain.zip',
];

const topicsByName = new Map();
for (const zipPath of zipPaths) {
  const { article } = readArticleZip(zipPath);
  const topic = article.topic;
  if (!topic || typeof topic.name !== 'string' || !topic.name.trim()) {
    throw new Error(zipPath + ': topic.name missing');
  }
  if (topic.name.length > 255) throw new Error(zipPath + ': topic.name exceeds blog_topic.name');
  const normalized = {
    name: topic.name.trim(),
    path: Array.isArray(topic.path) ? topic.path : topic.path,
  };
  const previous = topicsByName.get(normalized.name);
  if (previous && JSON.stringify(previous.path) !== JSON.stringify(normalized.path)) {
    throw new Error('Conflicting topic paths for ' + normalized.name);
  }
  topicsByName.set(normalized.name, normalized);
}

const db = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectTimeout: 15000,
  multipleStatements: false,
  ssl: process.env.MYSQL_SSL === 'true' ? {} : undefined,
});
try {
  const [[identity]] = await db.query('SELECT DATABASE() AS db, @@hostname AS host, @@read_only AS read_only');
  if (identity.db !== process.env.MYSQL_DATABASE) throw new Error('Database identity mismatch');
  if (Number(identity.read_only) !== 0) throw new Error('Database is read-only');
  const [[user]] = await db.query('SELECT id_user FROM users ORDER BY id_user LIMIT 1');
  if (!user?.id_user) throw new Error('No user found in users table');
  const [[topicCount]] = await db.query('SELECT COUNT(*) AS n FROM blog_topic');
  console.log('DB ' + JSON.stringify(identity));
  console.log('USING_EXISTING_USER_ID ' + user.id_user);
  console.log('EXISTING_TOPIC_COUNT ' + topicCount.n);
  await db.beginTransaction();
  const results = [];
  for (const topic of topicsByName.values()) {
    const [existing] = await db.execute(
      'SELECT id_blog_topic FROM blog_topic WHERE name=? ORDER BY id_blog_topic LIMIT 1',
      [topic.name]
    );
    if (existing.length) {
      results.push({name: topic.name, id: existing[0].id_blog_topic, action: 'kept-existing'});
      continue;
    }
    const value = JSON.stringify({path: topic.path, test_fixture: true});
    const [insert] = await db.execute(
      'INSERT INTO blog_topic (id_user,name,value,last_edit_datetime,last_edit_user,create_datetime) VALUES (?,?,?,?,?,?)',
      [user.id_user, topic.name, value, new Date(), user.id_user, new Date()]
    );
    results.push({name: topic.name, id: insert.insertId, action: 'inserted'});
  }
  await db.commit();
  const [verify] = await db.execute(
    'SELECT id_blog_topic,name,id_user,value,create_datetime FROM blog_topic WHERE name IN (' +
      [...topicsByName.keys()].map(() => '?').join(',') + ') ORDER BY id_blog_topic',
    [...topicsByName.keys()]
  );
  console.log('TOPIC_WRITE_RESULTS ' + JSON.stringify(results));
  console.log('TOPIC_READBACK ' + JSON.stringify(verify));
  if (verify.length !== topicsByName.size) throw new Error('Read-back count mismatch');
} catch (error) {
  try { await db.rollback(); } catch {}
  throw error;
} finally {
  await db.end();
}
