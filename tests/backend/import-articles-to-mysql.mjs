#!/usr/bin/env node
import mysql from 'mysql2/promise';
import path from 'node:path';
import { findZipFiles, readArticleZip } from '../../scripts/article-importer.mjs';

const required = [
  'MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD',
  'REPAIR_API_BASE', 'REPAIR_API_TOKEN', 'REPAIR_API_U_HASH',
];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) throw new Error('Missing required secrets: ' + missing.join(', '));

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
}

const apiRoot = process.env.REPAIR_API_BASE.trim().replace(/\/+$/, '');
const apiBase = apiRoot.endsWith('/api/v1') ? apiRoot : apiRoot + '/api/v1';
const auth = { token: process.env.REPAIR_API_TOKEN, u_hash: process.env.REPAIR_API_U_HASH };

function dataOf(json) {
  return json?.data?.data ?? json?.data ?? json;
}

async function dropboxPost(endpoint, fields = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, String(value));
  form.set('token', auth.token);
  form.set('u_hash', auth.u_hash);
  const response = await fetch(apiBase + '/' + endpoint.replace(/^\/+/, ''), {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: form,
    redirect: 'error',
    signal: AbortSignal.timeout(120000),
  });
  const raw = await response.text();
  let json;
  try { json = JSON.parse(raw); }
  catch { throw new Error('Dropbox ' + endpoint + ' returned non-JSON HTTP ' + response.status + ': ' + raw.slice(0, 300)); }
  if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') {
    const message = typeof json?.message === 'object' ? JSON.stringify(json.message) : String(json?.message ?? '');
    throw new Error('Dropbox ' + endpoint + ' failed HTTP ' + response.status + ', code ' + String(json?.code ?? 'n/a') + ': ' + message.slice(0, 1000));
  }
  return dataOf(json);
}

const MIME_BY_FORMAT = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  glb: 'model/gltf-binary',
  gltf: 'model/gltf+json',
};

async function uploadMediaToDropbox(asset, entry, ownerId, uploadedIds) {
  if (!entry || !Buffer.isBuffer(entry.data)) throw new Error('Media bytes are missing: ' + asset.file);
  const format = String(asset.format || path.extname(asset.file).slice(1)).toLowerCase();
  const mime = MIME_BY_FORMAT[format] || 'application/octet-stream';
  const base64 = 'data:' + mime + ';base64,' + entry.data.toString('base64');
  const result = await dropboxPost('dropbox/file/', {
    file: JSON.stringify({
      // createDropboxFile inserts this name into Dropbox-API-Arg; keep it ASCII/path-safe.
      name: path.basename(asset.file).replace(/[^A-Za-z0-9._-]/g, '_'),
      base64,
      private: -1,
      u_id: Number(ownerId),
    }),
  });
  const id = Number(result?.dl_id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Dropbox upload returned an invalid dl_id for ' + asset.file + ': ' + JSON.stringify(result));
  }
  uploadedIds.push(id);
  return 'dropbox:' + id;
}

function rewriteMediaReferences(article, mediaRefs) {
  const rewrite = (value, key = '') => {
    if (typeof value === 'string' && (key === 'file' || key === 'image') && mediaRefs.has(value)) {
      return mediaRefs.get(value);
    }
    if (Array.isArray(value)) return value.map((item) => rewrite(item));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([childKey, child]) => {
        if (childKey === 'file' || childKey === 'image') {
          return [childKey, typeof child === 'string' && mediaRefs.has(child) ? mediaRefs.get(child) : rewrite(child, childKey)];
        }
        return [childKey, rewrite(child, childKey)];
      }));
    }
    return value;
  };
  const result = rewrite(article);
  result.assets = article.assets.map((asset) => ({
    ...asset,
    source_file: asset.file,
    file: mediaRefs.get(asset.file),
  }));
  delete result.media_base_url;
  return result;
}

function hasLegacyMediaReferences(value) {
  if (Array.isArray(value)) return value.some(hasLegacyMediaReferences);
  if (!value || typeof value !== 'object') return false;
  for (const [key, child] of Object.entries(value)) {
    if ((key === 'file' || key === 'image') && typeof child === 'string' && child.startsWith('media/')) return true;
    if (hasLegacyMediaReferences(child)) return true;
  }
  return false;
}

function isAlreadyMigrated(value) {
  let article = value;
  if (typeof article === 'string') {
    try { article = JSON.parse(article); } catch { return false; }
  }
  if (!article || typeof article !== 'object' || !Array.isArray(article.assets) || !article.assets.length) return false;
  return article.assets.every((asset) => typeof asset?.file === 'string' && /^dropbox:\d+$/.test(asset.file)) &&
    !hasLegacyMediaReferences(article);
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

const uploadedIds = [];
let committed = false;
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
  const statusColumns = ['status','blog_status','id_blog_status','status_id','is_published','published'];
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
    const mediaNames = new Set(item.mediaEntries.map((entry) => entry.name));
    const assetNames = new Set(item.article.assets.map((asset) => asset.file));
    for (const file of mediaNames) if (!assetNames.has(file)) throw new Error('Unregistered media file in ZIP: ' + file);
    for (const file of assetNames) if (!mediaNames.has(file)) throw new Error('Registered media file is missing from ZIP: ' + file);
  }

  await db.beginTransaction();
  const writes = [];
  for (const item of imported) {
    const topicId = topicIds.get(item.article.topic.name);
    const [existing] = await db.execute(
      'SELECT id_blog_post,value' + (columns.has('content_json') ? ',content_json' : '') +
      ' FROM blog_post WHERE id_blog_topic=? AND name=? ORDER BY id_blog_post LIMIT 2 FOR UPDATE',
      [topicId, item.article.title]
    );
    if (existing.length > 1) throw new Error('Duplicate article rows for topic/title: ' + item.article.title);
    const row = existing[0];
    const id = row ? Number(row.id_blog_post) : 0;
    const storedContent = row ? (row.content_json || row.value) : null;
    if (row && isAlreadyMigrated(storedContent)) {
      writes.push({ slug: item.slug, title: item.article.title, id, action: 'already_in_dropbox' });
      continue;
    }

    const entriesByName = new Map(item.mediaEntries.map((entry) => [entry.name, entry]));
    const mediaRefs = new Map();
    for (const asset of item.article.assets) {
      const entry = entriesByName.get(asset.file);
      mediaRefs.set(asset.file, await uploadMediaToDropbox(asset, entry, Number(user.id_user), uploadedIds));
    }
    const article = rewriteMediaReferences(item.article, mediaRefs);
    const content = JSON.stringify(article);
    if (!id) {
      const insertColumns = ['id_blog_topic','id_user','name','value','last_edit_datetime','last_edit_user','create_datetime'];
      const insertValues = ['?','?','?','?','NOW(0)','?','NOW(0)'];
      const params = [topicId, Number(user.id_user), article.title, content, Number(user.id_user)];
      if (columns.has('content_json')) { insertColumns.push('content_json'); insertValues.push('?'); params.push(content); }
      if (columns.has('content_format')) { insertColumns.push('content_format'); insertValues.push("'json'"); }
      if (columns.has('content_version')) { insertColumns.push('content_version'); insertValues.push('?'); params.push(article.format_version); }
      const [result] = await db.execute(
        'INSERT INTO blog_post (' + insertColumns.join(',') + ') VALUES (' + insertValues.join(',') + ')',
        params
      );
      writes.push({ slug: item.slug, title: item.article.title, id: Number(result.insertId), action: 'inserted_with_dropbox_media' });
    } else {
      const updates = ['value=?','last_edit_datetime=NOW(0)','last_edit_user=?'];
      const params = [content, Number(user.id_user)];
      if (columns.has('content_json')) { updates.push('content_json=?'); params.push(content); }
      if (columns.has('content_format')) updates.push("content_format='json'");
      if (columns.has('content_version')) { updates.push('content_version=?'); params.push(article.format_version); }
      params.push(id);
      await db.execute('UPDATE blog_post SET ' + updates.join(',') + ' WHERE id_blog_post=?', params);
      writes.push({ slug: item.slug, title: item.article.title, id, action: 'migrated_existing_to_dropbox' });
    }
  }
  await db.commit();
  committed = true;

  const ids = writes.map((row) => row.id).filter((id) => id > 0);
  const contentExpr = columns.has('content_json') ? "COALESCE(NULLIF(content_json,''),value)" : 'value';
  const [readback] = await db.query(
    'SELECT id_blog_post,JSON_VALID(' + contentExpr + ') AS valid_json,' +
    'JSON_UNQUOTE(JSON_EXTRACT(' + contentExpr + ', "$.format_version")) AS format_version,' +
    'JSON_EXTRACT(' + contentExpr + ', "$.assets") AS assets_json ' +
    'FROM blog_post WHERE id_blog_post IN (' + ids.map(() => '?').join(',') + ') ORDER BY id_blog_post',
    ids
  );
  if (readback.length !== ids.length) throw new Error('Article readback count mismatch: ' + JSON.stringify(readback));
  for (const row of readback) {
    let assets = row.assets_json;
    if (typeof assets === 'string') {
      try { assets = JSON.parse(assets); } catch { assets = null; }
    }
    if (Number(row.valid_json) !== 1 || !['1.2','1.3'].includes(row.format_version) ||
        !Array.isArray(assets) || !assets.length ||
        assets.some((asset) => typeof asset?.file !== 'string' || !/^dropbox:\d+$/.test(asset.file))) {
      throw new Error('Dropbox media readback validation failed for article ' + row.id_blog_post + ': ' + JSON.stringify(row));
    }
  }
  console.log('DB_IDENTITY ' + JSON.stringify(identity));
  console.log('USING_EXISTING_USER_ID ' + Number(user.id_user));
  console.log('DROPBOX_MEDIA_UPLOADS ' + uploadedIds.length);
  console.log('ARTICLE_WRITE_RESULTS ' + JSON.stringify(writes));
  console.log('ARTICLE_READBACK ' + JSON.stringify(readback));
  console.log('MEDIA_STORAGE dropbox; file references use dropbox:<dl_id>; original source paths retained in assets[].source_file');
} catch (error) {
  if (!committed) {
    await db.rollback().catch(() => {});
    for (const id of uploadedIds.reverse()) {
      try { await dropboxPost('dropbox/file/' + id + '/del'); }
      catch (cleanupError) { console.error('DROPBOX_ORPHAN_CLEANUP_FAILED ' + id + ' ' + String(cleanupError)); }
    }
  }
  throw error;
} finally {
  await db.end();
}
