#!/usr/bin/env node
import fs from 'node:fs';

const required = ['REPAIR_API_BASE','REPAIR_API_TOKEN','REPAIR_API_U_HASH'];
for (const key of required) if (!process.env[key]) throw new Error('Missing API environment value: ' + key);
const rawBase = process.env.REPAIR_API_BASE.trim();
const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
const url = new URL(base + '/api/v1/data');
if (url.protocol !== 'https:') throw new Error('Refusing non-HTTPS API endpoint');

async function post(path, form) {
  const response = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', Accept: 'application/json' },
    body: form,
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  const raw = await response.text();
  let json;
  try { json = JSON.parse(raw); } catch { throw new Error(path + ' returned non-JSON HTTP ' + response.status); }
  if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') {
    throw new Error(path + ' rejected request: HTTP ' + response.status + ', API code ' +
      String(json?.code ?? 'n/a') + ', message ' + String(json?.message ?? 'n/a').slice(0, 250));
  }
  return json;
}

const source = fs.readFileSync('script_templates/repair_api_test_page.php', 'utf8');
const updateForm = new URLSearchParams({
  data: JSON.stringify({ script_templates: [{ var: 'repair_api_test_page', file: source }] }),
  token: process.env.REPAIR_API_TOKEN,
  u_hash: process.env.REPAIR_API_U_HASH,
});
const updated = await post('/api/v1/data', updateForm);
console.log('Template update accepted: ' + JSON.stringify({
  code: updated.code, status: updated.status, created_id: updated.data?.created_id,
  affected_fields: updated.data?.affected_fields, version: updated.data?.version,
}));

const inspectForm = new URLSearchParams({
  is_var: '1',
  s_t_data: JSON.stringify({ action: 'inspectBlogDb' }),
  token: process.env.REPAIR_API_TOKEN,
  u_hash: process.env.REPAIR_API_U_HASH,
});
const inspected = await post('/api/v1/script/template/repair_api_test_page/', inspectForm);
const data = inspected.data?.data ?? inspected.data;
if (!data || typeof data !== 'object') throw new Error('inspectBlogDb returned no object');
console.log('ARTICLE_DB_INSPECTION ' + JSON.stringify(data));
