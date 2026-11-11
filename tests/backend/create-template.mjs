#!/usr/bin/env node
// Re-run preflight/create after comment-flow test found the server template missing.

const required = ['REPAIR_API_BASE', 'REPAIR_API_TOKEN', 'REPAIR_API_U_HASH'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error('Missing required GitHub Actions secrets: ' + missing.join(', '));

const base = process.env.REPAIR_API_BASE.replace(/\/+$/, '');
const url = new URL(base + '/api/v1/data');
if (url.protocol !== 'https:') throw new Error('HTTPS is required.');

const auth = {
  token: process.env.REPAIR_API_TOKEN,
  u_hash: process.env.REPAIR_API_U_HASH,
};

async function post(fields, label) {
  const form = new URLSearchParams(fields);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Accept': 'application/json',
    },
    body: form,
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  const raw = await response.text();
  let result;
  try { result = JSON.parse(raw); }
  catch { throw new Error(label + ': backend returned non-JSON HTTP ' + response.status); }
  if (!response.ok || result?.status === 'error' || String(result?.code) !== '200') {
    throw new Error(label + ': backend rejected request (HTTP ' + response.status + ', code ' + String(result?.code) + ', message ' + String(result?.message || 'not provided').slice(0, 200) + ')');
  }
  return result;
}

console.log('Backend host: ' + url.origin);
console.log('Preflight: reading script_templates to avoid duplicate creation.');

const inventory = await post({
  private: '1',
  fields: 'script_templates',
  ...auth,
}, 'Preflight read');

const recordsValue = inventory?.data?.script_templates;
if (recordsValue == null) throw new Error('Preflight did not return script_templates; refusing to write.');
const records = Array.isArray(recordsValue)
  ? recordsValue
  : typeof recordsValue === 'object' ? Object.values(recordsValue) : [];
const existing = records.find((item) => item && item.var === 'repair_api_test_page');

if (existing) {
  console.log('NO-OP: repair_api_test_page already exists; no write performed.');
  process.exit(0);
}

const fs = await import('node:fs/promises');
const file = await fs.readFile('script_templates/repair_api_test_page.php', 'utf8');
if (!file.startsWith('<?php')) throw new Error('Template source is not a PHP file.');
if (!file.includes('repair_api_test_page.php')) throw new Error('Template source does not contain the agreed template name.');

const payload = {
  script_templates: [{
    var: 'repair_api_test_page',
    file,
  }],
};

console.log('Creating one script_templates record: repair_api_test_page.');
const created = await post({
  private: '1',
  data: JSON.stringify(payload),
  ...auth,
}, 'Template creation');

console.log('Creation request accepted by backend.');
console.log('API status: ' + String(created?.status));
console.log('API code: ' + String(created?.code));
console.log('Response data keys: ' + Object.keys(created?.data || {}).join(', '));
