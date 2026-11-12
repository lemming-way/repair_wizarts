#!/usr/bin/env node
// Update only the access flag of the existing repair_api_test_page template.
const required = ['REPAIR_API_BASE','REPAIR_API_TOKEN','REPAIR_API_U_HASH'];
for (const key of required) if (!process.env[key]) throw new Error('Missing ' + key);
let base = process.env.REPAIR_API_BASE.trim();
while (base.endsWith('/')) base = base.slice(0, -1);
if (new URL(base + '/api/v1/data').protocol !== 'https:') throw new Error('HTTPS required');

async function post(fields, label) {
  const response = await fetch(base + '/api/v1/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', Accept: 'application/json' },
    body: new URLSearchParams(fields),
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  const raw = await response.text();
  let json;
  try { json = JSON.parse(raw); } catch { throw new Error(label + ': non-JSON HTTP ' + response.status); }
  if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') {
    throw new Error(label + ': HTTP ' + response.status + ', code ' + String(json?.code) + ', message ' + JSON.stringify(json?.message));
  }
  return json;
}

const auth = {
  token: process.env.REPAIR_API_TOKEN,
  u_hash: process.env.REPAIR_API_U_HASH,
};

async function readTemplates() {
  const response = await post({ private: '1', fields: 'script_templates', ...auth }, 'Read templates');
  const value = response?.data?.script_templates;
  if (!value || typeof value !== 'object') throw new Error('script_templates missing; refusing update');
  const entries = Array.isArray(value)
    ? value.map((record, index) => [String(record?.id ?? record?.id_script_template ?? index), record])
    : Object.entries(value);
  const entry = entries.find(([, record]) => record?.var === 'repair_api_test_page');
  if (!entry) throw new Error('repair_api_test_page not found; refusing to create');
  const recordId = String(entry[1]?.id ?? entry[1]?.id_script_template ?? entry[0]);
  if (!/^\\d+$/.test(recordId)) throw new Error('Unexpected template ID; refusing update');
  return { recordId, record: entry[1] };
}

const { recordId, record } = await readTemplates();
if (String(record.only_admin) === '0') {
  console.log('NO_CHANGE: only_admin is already 0');
} else {
  if (String(record.only_admin) !== '1') throw new Error('Unexpected only_admin value; refusing to overwrite');

  // editData() interprets record.id as the existing id_script_template.
  // The outer array key is not an update identifier; omitting id causes INSERT.
  const data = {
    script_templates: [{
      id: recordId,
      only_admin: '0',
    }],
  };
  const result = await post({ private: '1', data: JSON.stringify(data), ...auth }, 'Update template access');
  console.log('ACCESS_FLAG_UPDATE ' + JSON.stringify({
    code: result.code,
    status: result.status,
    target: 'repair_api_test_page',
    record_id: recordId,
    only_admin: '0',
  }));
}

const verified = await readTemplates();
if (verified.recordId !== recordId || String(verified.record.only_admin) !== '0') {
  throw new Error('Post-update verification failed');
}
console.log('ACCESS_FLAG_VERIFIED ' + JSON.stringify({
  target: 'repair_api_test_page',
  record_id: verified.recordId,
  only_admin: verified.record.only_admin,
}));
