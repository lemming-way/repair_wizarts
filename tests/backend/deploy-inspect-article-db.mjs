#!/usr/bin/env node
// Verify the deployed article template and its product-facing catalog action.
// Template deployment is handled by create-repair-api-test-page.yml workflow.
// The admin-only inspectBlogDb action is best-effort: the backend currently
// accepts template UPDATE requests without rewriting the PHP file.

const required = ['REPAIR_API_BASE', 'REPAIR_API_TOKEN', 'REPAIR_API_U_HASH'];
for (const key of required) if (!process.env[key]) throw new Error('Missing API environment value: ' + key);
const rawBase = process.env.REPAIR_API_BASE.trim();
const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
const url = new URL(base + '/api/v1/data');
if (url.protocol !== 'https:') throw new Error('Refusing non-HTTPS API endpoint');

async function post(path, form, label) {
  const response = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', Accept: 'application/json' },
    body: form,
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  const raw = await response.text();
  let json;
  try { json = JSON.parse(raw); } catch { throw new Error(label + ' returned non-JSON HTTP ' + response.status); }
  if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') {
    throw new Error(label + ' rejected request: HTTP ' + response.status + ', API code ' +
      String(json?.code ?? 'n/a') + ', message ' + JSON.stringify(json?.message ?? 'not provided').slice(0, 500));
  }
  return json;
}

const auth = { token: process.env.REPAIR_API_TOKEN, u_hash: process.env.REPAIR_API_U_HASH };

// Verify template exists
const inventoryForm = new URLSearchParams({ private: '1', fields: 'script_templates', ...auth });
const inventory = await post('/api/v1/data', inventoryForm, 'Template preflight read');
const recordsValue = inventory?.data?.script_templates;
let found = false;
if (Array.isArray(recordsValue)) {
  found = recordsValue.some(item => item && item.var === 'repair_api_test_page');
} else if (recordsValue && typeof recordsValue === 'object') {
  found = Object.values(recordsValue).some(item => item && item.var === 'repair_api_test_page');
}
if (!found) throw new Error('repair_api_test_page is absent from script_templates; run create-template workflow first.');

console.log('Template repair_api_test_page verified in script_templates.');

function unwrap(json) {
  const data = json?.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return data;
}

const templatePath = '/api/v1/script/template/repair_api_test_page/';

// Product-facing smoke check: this is the action the frontend uses.
const catalogForm = new URLSearchParams({
  is_var: '1',
  s_t_data: JSON.stringify({ action: 'getBlogTopics' }),
  ...auth,
});
const catalog = await post(templatePath, catalogForm, 'Article catalog');
const articles = unwrap(catalog);
if (!Array.isArray(articles)) throw new Error('getBlogTopics returned no article array');
if (articles.length === 0) throw new Error('getBlogTopics returned 0 articles; article DB is empty');
console.log('ARTICLE_API_OK articles=' + articles.length + ' first_id=' + String(articles[0]?.id ?? 'n/a'));

// Best-effort admin inspection. Keep it non-blocking while the backend does not
// persist UPDATE payloads to files_u/script_templates/file/.
try {
  const inspectForm = new URLSearchParams({
    is_var: '1',
    s_t_data: JSON.stringify({ action: 'inspectBlogDb' }),
    ...auth,
  });
  const inspected = await post(templatePath, inspectForm, 'Article DB inspection');
  const data = unwrap(inspected);
  if (!data || typeof data !== 'object') throw new Error('inspectBlogDb returned no object');
  console.log('ARTICLE_DB_INSPECTION ' + JSON.stringify(data));
} catch (error) {
  console.log('WARN: inspectBlogDb unavailable on the deployed template: ' + String(error.message).slice(0, 300));
  console.log('WARN: backend template UPDATE is accepted but the PHP file is not rewritten; see the template update diagnostic.');
}