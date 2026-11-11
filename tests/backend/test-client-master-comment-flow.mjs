#!/usr/bin/env node
// Verifies a real client -> master comment/reply flow using two separate accounts.
// QA comments are intentionally retained for frontend verification.
// Trigger revision: run the authenticated client/master integration on this branch.
const required = [
  'REPAIR_API_BASE',
  'BLOG_TEST_CLIENT_LOGIN', 'BLOG_TEST_CLIENT_PASSWORD',
  'BLOG_TEST_MASTER_LOGIN', 'BLOG_TEST_MASTER_PASSWORD',
];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error('Missing required GitHub Actions secrets: ' + missing.join(', '));

const base = process.env.REPAIR_API_BASE.replace(/\\/+$/, '');
if (new URL(base).protocol !== 'https:') throw new Error('Refusing non-HTTPS backend');
const apiBase = base + '/api/v1/';
const templateEndpoint = apiBase + 'script/template/repair_api_test_page/';
const marker = '[QA-CLIENT-MASTER-COMMENT-' +
  (process.env.GITHUB_RUN_ID || 'manual') + '-' +
  (process.env.GITHUB_RUN_ATTEMPT || '1') + ']';

function unwrap(json) {
  return json && json.data !== undefined ? json.data : json;
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
async function postJson(path, payload) {
  const response = await fetch(apiBase + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', Accept: 'application/json' },
    body: new URLSearchParams(payload),
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  let json;
  try { json = await response.json(); }
  catch { throw new Error(path + ': non-JSON response, HTTP ' + response.status); }
  if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') {
    throw new Error(path + ': authentication request failed, HTTP ' + response.status +
      ', API code ' + String(json?.code ?? 'n/a') + ', status ' + String(json?.status ?? 'n/a'));
  }
  return json;
}
function normalizeLogin(login) {
  if (login.includes('@')) return login;
  const trimmed = login.trim();
  const digits = trimmed.replace(/\\D/g, '');
  return trimmed.startsWith('+') ? '+' + digits : digits;
}
async function authenticate(prefix, expectedRole) {
  const rawLogin = process.env['BLOG_TEST_' + prefix + '_LOGIN'];
  const password = process.env['BLOG_TEST_' + prefix + '_PASSWORD'];
  const type = process.env['BLOG_TEST_' + prefix + '_LOGIN_TYPE'] ||
    (rawLogin.includes('@') ? 'e-mail' : 'phone');
  assert(type === 'phone' || type === 'e-mail', prefix + ': LOGIN_TYPE must be phone or e-mail');

  const authJson = await postJson('auth', {
    login: type === 'phone' ? normalizeLogin(rawLogin) : rawLogin,
    password,
    type,
  });
  const authData = unwrap(authJson);
  const authHash = authData?.auth_hash ?? authJson?.auth_hash;
  assert(typeof authHash === 'string' && authHash.length > 0, prefix + ': auth_hash missing');

  const tokenJson = await postJson('token', { auth_hash: authHash, au: 'f' });
  const tokenData = unwrap(tokenJson);
  const authUser = tokenJson?.auth_user ?? tokenData?.auth_user;
  const token = tokenData?.token ?? tokenJson?.token;
  const uHash = tokenData?.u_hash ?? tokenJson?.u_hash;
  const uId = Number(tokenData?.u_id ?? tokenJson?.u_id ?? authUser?.u_id);
  assert(typeof token === 'string' && token.length > 0, prefix + ': token missing');
  assert(typeof uHash === 'string' && uHash.length > 0, prefix + ': u_hash missing');
  assert(Number.isInteger(uId) && uId > 0, prefix + ': user ID missing');
  assert(authUser && Number(authUser.u_role) === expectedRole,
    prefix + ': expected role ' + expectedRole + ', received ' + String(authUser?.u_role ?? 'unknown'));
  if (authUser.u_id !== undefined) {
    assert(Number(authUser.u_id) === uId, prefix + ': auth_user ID mismatch');
  }
  console.log('PASS: ' + prefix.toLowerCase() + ' authenticated; role=' + expectedRole + ', user_id=' + uId);
  return { token, uHash, uId, role: expectedRole };
}
function dataOf(result) {
  const data = result?.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return data;
}
async function templateApi(session, action, fields = {}) {
  const form = new URLSearchParams({
    is_var: '1',
    s_t_data: JSON.stringify({ action, ...fields }),
    token: session.token,
    u_hash: session.uHash,
  });
  const response = await fetch(templateEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', Accept: 'application/json' },
    body: form,
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  let json;
  try { json = await response.json(); }
  catch { throw new Error(action + ': non-JSON response, HTTP ' + response.status); }
  if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') {
    throw new Error(action + ': API request failed, HTTP ' + response.status +
      ', API code ' + String(json?.code ?? 'n/a') + ', status ' + String(json?.status ?? 'n/a'));
  }
  return dataOf(json);
}

const client = await authenticate('CLIENT', 1);
const master = await authenticate('MASTER', 2);
const articles = await templateApi(client, 'getBlogTopics');
assert(Array.isArray(articles) && articles.length > 0,
  'No published articles returned; no comments were written.');
const article = articles[0];
const articleId = Number(article.id);
assert(Number.isInteger(articleId) && articleId > 0, 'Published article has invalid ID');

const rootText = 'Тест Repair Wizards: вопрос клиента ' + marker;
const rootResult = await templateApi(client, 'addBlogPost', {
  article_id: articleId,
  text: rootText,
});
const rootId = Number(rootResult?.id);
assert(Number.isInteger(rootId) && rootId > 0,
  'Client comment insert returned no valid ID. Article=' + articleId);
console.log('Created client comment: id=' + rootId + ', article_id=' + articleId);

const afterRoot = await templateApi(master, 'getBlogPosts', { article_id: articleId });
assert(Array.isArray(afterRoot), 'Master could not read article comments after client insert');
const root = afterRoot.find((item) => Number(item.id) === rootId);
assert(root, 'Client comment is not visible to master; root_id=' + rootId);
assert(root.text === rootText, 'Client comment text mismatch; root_id=' + rootId);
assert(root.parent_id === null || root.parent_id === undefined || Number(root.parent_id) === 0,
  'Client comment is not a root comment; root_id=' + rootId);
assert(Number(root.author?.id) === client.uId, 'Root comment author ID is not the client account');
assert(Number(root.author?.role) === 1, 'Root comment author role is not client (1)');
console.log('PASS: master reads client root comment with correct text, parent and author role');

const replyText = 'Тест Repair Wizards: ответ мастера ' + marker;
const replyResult = await templateApi(master, 'addBlogPost', {
  article_id: articleId,
  parent_id: rootId,
  text: replyText,
});
const replyId = Number(replyResult?.id);
assert(Number.isInteger(replyId) && replyId > 0,
  'Master reply insert returned no valid ID. Root=' + rootId);
console.log('Created master reply: id=' + replyId + ', parent_id=' + rootId);

const finalComments = await templateApi(client, 'getBlogPosts', { article_id: articleId });
assert(Array.isArray(finalComments), 'Client could not read comments after master reply');
const verifiedRoot = finalComments.find((item) => Number(item.id) === rootId);
const reply = finalComments.find((item) => Number(item.id) === replyId);
assert(verifiedRoot && verifiedRoot.text === rootText, 'Client cannot read back the original client comment');
assert(reply, 'Master reply is not visible to client; reply_id=' + replyId);
assert(reply.text === replyText, 'Master reply text mismatch; reply_id=' + replyId);
assert(Number(reply.parent_id) === rootId, 'Master reply parent_id does not reference client comment');
assert(Number(reply.author?.id) === master.uId, 'Reply author ID is not the master account');
assert(Number(reply.author?.role) === 2, 'Reply author role is not master (2)');

console.log('PASS: client reads master reply with correct text, parent_id and author role');
console.log('RESULT: PASS — client comment -> master reply; article_id=' + articleId +
  ', client_comment_id=' + rootId + ', master_reply_id=' + replyId);
console.log('Both QA comments are intentionally retained in the database for frontend verification.');
