#!/usr/bin/env node
import fs from 'node:fs';

const required = ['REPAIR_API_BASE','REPAIR_API_TOKEN','REPAIR_API_U_HASH'];
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
const inventoryForm = new URLSearchParams({ private: '1', fields: 'script_templates', ...auth });
const inventory = await post('/api/v1/data', inventoryForm, 'Template preflight read');
const recordsValue = inventory?.data?.script_templates;
let records;
let existingKey = null;
if (Array.isArray(recordsValue)) {
  records = recordsValue;
} else if (recordsValue && typeof recordsValue === 'object') {
  const entries = Object.entries(recordsValue);
  records = entries.map(([key, value]) => {
    if (value && typeof value === 'object' && value.var === 'repair_api_test_page') existingKey = key;
    return value;
  });
} else {
  records = [];
}
const existing = records.find(item => item && item.var === 'repair_api_test_page');
if (!existing) throw new Error('repair_api_test_page is absent from script_templates; refusing to create or overwrite a new record');

// Extract the ID (key in the object or id_script_template field) for UPDATE
const templateId = existingKey ?? existing.id_script_template ?? existing.id ?? existing.id_script_template;
if (!templateId) {
  console.log('DEBUG: existing record keys:', Object.keys(existing));
  console.log('DEBUG: existing record:', JSON.stringify(existing, null, 2));
  throw new Error('Existing template record has no identifiable ID; cannot update safely.');
}

const source = fs.readFileSync('script_templates/repair_api_test_page.php', 'utf8');
if (!source.startsWith('<?php')) throw new Error('Template source is not PHP');
const updatedRecord = { id: templateId, var: 'repair_api_test_page', file: source };
const updateForm = new URLSearchParams({
  private: '1',
  data: JSON.stringify({ script_templates: [updatedRecord] }),
  ...auth,
});
const updated = await post('/api/v1/data', updateForm, 'Template update');
console.log('Template update accepted: ' + JSON.stringify({
  code: updated.code, status: updated.status,
  affected_fields: updated.data?.affected_fields, version: updated.data?.version,
}));

const inspectForm = new URLSearchParams({
  is_var: '1',
  s_t_data: JSON.stringify({ action: 'inspectBlogDb' }),
  ...auth,
});
const inspected = await post('/api/v1/script/template/repair_api_test_page/', inspectForm, 'Article DB inspection');
const data = inspected.data?.data ?? inspected.data;
if (!data || typeof data !== 'object') throw new Error('inspectBlogDb returned no object');
console.log('ARTICLE_DB_INSPECTION ' + JSON.stringify(data));
