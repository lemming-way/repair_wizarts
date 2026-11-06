#!/usr/bin/env node
// Authenticated integration test against the live DB through repair_api_test_page.
// Test comments are deliberately retained for frontend verification and carry
// a unique marker. No existing article/comment/user is modified or deleted.
const required = ['REPAIR_API_BASE', 'REPAIR_API_TOKEN', 'REPAIR_API_U_HASH'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error('Missing required environment variables: ' + missing.join(', '));

const base = process.env.REPAIR_API_BASE.replace(/\/+$/, '');
if (new URL(base).protocol !== 'https:') throw new Error('Refusing non-HTTPS backend');
const endpoint = base + '/api/v1/script/template/repair_api_test_page/';
const marker = '[QA-ART-COM-' + (process.env.GITHUB_RUN_ID || 'manual') + '-' +
  (process.env.GITHUB_RUN_ATTEMPT || '1') + ']';

function dataOf(result) {
  const data = result?.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return data;
}

async function api(action, fields = {}, expectError = false) {
  const form = new URLSearchParams({
    is_var: '1',
    s_t_data: JSON.stringify({ action, ...fields }),
    token: process.env.REPAIR_API_TOKEN,
    u_hash: process.env.REPAIR_API_U_HASH,
  });
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', Accept: 'application/json' },
    body: form,
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  const raw = await response.text();
  let result;
  try { result = JSON.parse(raw); } catch {
    throw new Error(action + ': non-JSON response, HTTP ' + response.status);
  }
  const ok = response.ok && result?.status !== 'error' && String(result?.code) === '200';
  if (expectError) {
    if (ok) throw new Error(action + ': invalid request unexpectedly succeeded');
    return result;
  }
  if (!ok) {
    throw new Error(action + ': failed, HTTP ' + response.status + ', API code ' +
      String(result?.code ?? 'n/a') + ', status ' + String(result?.status ?? 'n/a'));
  }
  return dataOf(result);
}

function check(condition, message) {
  if (!condition) throw new Error(message);
}

const articles = await api('getBlogTopics');
check(Array.isArray(articles) && articles.length > 0, 'No published articles returned');
const initialCounts = new Map(articles.map((a) => [Number(a.id), Number(a.comments_count) || 0]));
const roots = new Map();
console.log('Published articles: ' + articles.length);
console.log('Persistent QA marker: ' + marker);

// Validation must reject an oversized comment without creating a row.
await api('addBlogPost', {
  article_id: Number(articles[0].id),
  text: 'я'.repeat(1001),
}, true);
console.log('PASS: rejects a 1001-character comment');

for (const article of articles) {
  const articleId = Number(article.id);
  const rootText = 'Тест Repair Wizards: корневой комментарий ' + marker + ' article=' + articleId;
  const inserted = await api('addBlogPost', { article_id: articleId, text: rootText });
  const rootId = Number(inserted?.id);
  check(Number.isInteger(rootId) && rootId > 0, 'No root comment ID for article ' + articleId);
  roots.set(articleId, rootId);

  let comments = await api('getBlogPosts', { article_id: articleId });
  check(Array.isArray(comments), 'getBlogPosts did not return an array');
  let root = comments.find((c) => Number(c.id) === rootId);
  check(root && root.text === rootText && root.parent_id === null && root.deleted === false,
    'Root insert/read failed for article ' + articleId);

  const rootEdited = rootText + ' | edit verified';
  await api('editBlogPost', { id: rootId, text: rootEdited });
  comments = await api('getBlogPosts', { article_id: articleId });
  root = comments.find((c) => Number(c.id) === rootId);
  check(root && root.text === rootEdited && root.can_edit === true && root.can_delete === true,
    'Root edit/permissions failed for article ' + articleId);

  const replyText = 'Тест Repair Wizards: ответ ' + marker + ' article=' + articleId;
  const replyResult = await api('addBlogPost', {
    article_id: articleId, parent_id: rootId, text: replyText,
  });
  const replyId = Number(replyResult?.id);
  check(Number.isInteger(replyId) && replyId > 0, 'No reply ID for article ' + articleId);
  comments = await api('getBlogPosts', { article_id: articleId });
  let reply = comments.find((c) => Number(c.id) === replyId);
  check(reply && Number(reply.parent_id) === rootId && reply.text === replyText,
    'Nested reply insert/read failed for article ' + articleId);

  const replyEdited = replyText + ' | edit verified';
  await api('editBlogPost', { id: replyId, text: replyEdited });
  comments = await api('getBlogPosts', { article_id: articleId });
  reply = comments.find((c) => Number(c.id) === replyId);
  check(reply && reply.text === replyEdited && reply.can_edit === true,
    'Nested reply edit failed for article ' + articleId);

  // A separate latest reply is soft-deleted; the visible root/reply stay intact.
  const probe = await api('addBlogPost', {
    article_id: articleId, parent_id: rootId,
    text: 'Тест Repair Wizards: soft-delete probe ' + marker + ' article=' + articleId,
  });
  const probeId = Number(probe?.id);
  check(Number.isInteger(probeId) && probeId > 0, 'No delete-probe ID for article ' + articleId);
  await api('deleteBlogPost', { id: probeId });
  comments = await api('getBlogPosts', { article_id: articleId });
  const deleted = comments.find((c) => Number(c.id) === probeId);
  check(deleted && deleted.deleted === true && deleted.text === '',
    'Soft delete/read failed for article ' + articleId);
  console.log('PASS article ' + articleId + ': root insert/read/edit; reply insert/read/edit; soft delete');
}

// Cross-article parent must be rejected; this request must not insert anything.
if (articles.length > 1) {
  await api('addBlogPost', {
    article_id: Number(articles[1].id),
    parent_id: roots.get(Number(articles[0].id)),
    text: 'Invalid cross-article reply ' + marker,
  }, true);
  console.log('PASS: rejects a parent comment belonging to another article');
}

const refreshed = await api('getBlogTopics');
check(Array.isArray(refreshed), 'Final article list unavailable');
for (const article of articles) {
  const id = Number(article.id);
  const current = refreshed.find((a) => Number(a.id) === id);
  const expected = initialCounts.get(id) + 2;
  check(current && Number(current.comments_count) === expected,
    'comments_count mismatch for article ' + id + ': expected ' + expected +
    ', got ' + String(current?.comments_count));
}
console.log('PASS: comments_count includes the two visible QA comments and excludes soft-deleted probes');
console.log('Created ' + (articles.length * 3) + ' QA rows; ' + (articles.length * 2) +
  ' remain visible, ' + articles.length + ' are soft-deleted.');
console.log('QA comments are intentionally retained in the live DB for UI verification.');
