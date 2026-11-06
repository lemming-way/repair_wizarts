#!/usr/bin/env node
// Executes only the read-only getBlogTopics action in repair_api_test_page.
const required = ['REPAIR_API_BASE', 'REPAIR_API_TOKEN', 'REPAIR_API_U_HASH'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) throw new Error('Missing required environment variables: ' + missing.join(', '));
const base = process.env.REPAIR_API_BASE.replace(/\\/+$/, '');
const parsed = new URL(base);
if (parsed.protocol !== 'https:') throw new Error('Refusing non-HTTPS backend');
const endpoint = base + '/api/v1/script/template/repair_api_test_page/';
const form = new URLSearchParams({
  is_var: '1',
  s_t_data: JSON.stringify({ action: 'getBlogTopics' }),
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
  console.error('FAIL: non-JSON response; HTTP ' + response.status + ', content-type=' + (response.headers.get('content-type') || 'unset'));
  process.exit(1);
}
console.log('HTTP status: ' + response.status);
console.log('API status: ' + (result?.status ?? 'not provided'));
console.log('API code: ' + (result?.code ?? 'not provided'));
if (!response.ok || result?.status === 'error' || String(result?.code) !== '200') {
  console.error('FAIL: ' + String(result?.message ?? 'template execution rejected').slice(0, 500));
  process.exit(1);
}
const data = result?.data;
const articles = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : null);
if (!articles) {
  console.log('PASS: template executed; response data type=' + (data === null ? 'null' : typeof data));
  console.log('Returned keys=' + (data && typeof data === 'object' ? Object.keys(data).join(',') : 'none'));
  process.exit(0);
}
console.log('PASS: repair_api_test_page executed getBlogTopics (read-only).');
console.log('Articles returned: ' + articles.length);
for (const [i, article] of articles.slice(0, 10).entries()) {
  console.log('Article[' + i + ']: id=' + String(article?.id ?? 'n/a') +
    '; title_length=' + String(typeof article?.title === 'string' ? article.title.length : 0) +
    '; has_content=' + String(article?.content !== undefined && article?.content !== null));
}
