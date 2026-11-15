#!/usr/bin/env node
// Read-only-ish diagnostic for script_templates UPDATE behavior.
// It sends the same payload as create-template.mjs but prints request metadata
// and the API response without leaking tokens or the PHP file body.

import crypto from 'node:crypto';
import fs from 'node:fs/promises';

const required = ['REPAIR_API_BASE', 'REPAIR_API_TOKEN', 'REPAIR_API_U_HASH'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error('Missing required environment variables: ' + missing.join(', '));

const base = process.env.REPAIR_API_BASE.replace(/\/+$/, '');
const endpoint = new URL(base + '/api/v1/data');
if (endpoint.protocol !== 'https:') throw new Error('HTTPS is required.');

const auth = {
  token: process.env.REPAIR_API_TOKEN,
  u_hash: process.env.REPAIR_API_U_HASH,
};

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function normalizeRecords(value) {
  if (Array.isArray(value)) {
    return value.map((item, index) => [item?.id_script_template ?? item?.id ?? index, item]);
  }
  if (value && typeof value === 'object') return Object.entries(value);
  return [];
}

function recordSummary(record) {
  const summary = {};
  for (const [key, value] of Object.entries(record || {})) {
    if (value == null) {
      summary[key] = value;
      continue;
    }
    if (typeof value === 'string') {
      if (/token|password|secret|u_hash/i.test(key)) {
        summary[key] = '<redacted>';
      } else if (/^(file|content|code)$/i.test(key) || value.length > 200) {
        summary[key] = { length: value.length, sha256: sha256(value).slice(0, 16) };
      } else {
        summary[key] = value;
      }
      continue;
    }
    summary[key] = value;
  }
  return summary;
}

async function readInventory(label) {
  const form = new URLSearchParams({ private: '1', fields: 'script_templates', ...auth });
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Accept: 'application/json',
    },
    body: form,
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  const raw = await response.text();
  let json;
  try { json = JSON.parse(raw); } catch { throw new Error(label + ': non-JSON HTTP ' + response.status); }
  if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') {
    throw new Error(label + ': rejected (HTTP ' + response.status + ', code ' + String(json?.code) + ')');
  }
  return json;
}

const beforeJson = await readInventory('Preflight read');
const beforeRecords = normalizeRecords(beforeJson?.data?.script_templates);
const beforeEntry = beforeRecords.find(([, item]) => item?.var === 'repair_api_test_page');
if (!beforeEntry) throw new Error('repair_api_test_page not found; refusing to update.');

const beforeId = Number(beforeEntry[0]);
const beforeRecord = beforeEntry[1];
if (!Number.isInteger(beforeId) || beforeId <= 0) {
  throw new Error('Could not determine numeric template ID; refusing to update.');
}

const source = await fs.readFile('script_templates/repair_api_test_page.php', 'utf8');
const sourceHash = sha256(source);
const payload = {
  script_templates: [{
    id: beforeId,
    var: 'repair_api_test_page',
    file: source,
  }],
};

console.log('REQUEST ' + JSON.stringify({
  method: 'POST',
  url: endpoint.origin + endpoint.pathname,
  contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
  form: {
    private: '1',
    token: '<redacted>',
    u_hash: '<redacted>',
    data: {
      script_templates: [{
        id: beforeId,
        var: 'repair_api_test_page',
        file: { length: source.length, sha256: sourceHash.slice(0, 16) },
      }],
    },
  },
}, null, 2));

console.log('BEFORE ' + JSON.stringify(recordSummary(beforeRecord), null, 2));

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    Accept: 'application/json',
  },
  body: new URLSearchParams({
    private: '1',
    data: JSON.stringify(payload),
    ...auth,
  }),
  redirect: 'error',
  signal: AbortSignal.timeout(30000),
});
const raw = await response.text();
let json;
try { json = JSON.parse(raw); } catch { throw new Error('Update returned non-JSON HTTP ' + response.status); }

console.log('RESPONSE_HTTP ' + response.status);
console.log('RESPONSE ' + JSON.stringify({
  status: json?.status,
  code: json?.code,
  message: String(json?.message ?? '').slice(0, 500),
  data: {
    keys: Object.keys(json?.data || {}),
    affected_fields: json?.data?.affected_fields,
    forbidden_fields: json?.data?.forbidden_fields,
    created_id: json?.data?.created_id,
    deleted_id: json?.data?.deleted_id,
    version: json?.data?.version,
  },
}, null, 2));

const afterJson = await readInventory('Post-update read');
const afterRecords = normalizeRecords(afterJson?.data?.script_templates);
const afterEntry = afterRecords.find(([, item]) => item?.var === 'repair_api_test_page');
const afterRecord = afterEntry?.[1] ?? null;

console.log('AFTER ' + JSON.stringify(recordSummary(afterRecord), null, 2));

const fields = ['value', 'hash', 'file_hash', 'version', 'active', 'only_admin'];
const changes = {};
for (const field of fields) {
  const beforeValue = beforeRecord?.[field];
  const afterValue = afterRecord?.[field];
  if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
    changes[field] = { before: beforeValue, after: afterValue };
  }
}
console.log('CHANGES ' + JSON.stringify(changes, null, 2));

const fileAffected = Array.isArray(json?.data?.affected_fields) && json.data.affected_fields.includes('file');
const fileForbidden = Array.isArray(json?.data?.forbidden_fields) && json.data.forbidden_fields.includes('file');
console.log('DIAGNOSIS ' + JSON.stringify({
  file_affected: fileAffected,
  file_forbidden: fileForbidden,
  local_source_sha256: sourceHash.slice(0, 16),
  server_value: afterRecord?.value ?? null,
  server_hash: afterRecord?.hash ?? afterRecord?.file_hash ?? null,
}));
