#!/usr/bin/env node
// Change only the access flag of the existing repair_api_test_page record.
const required = ['REPAIR_API_BASE','REPAIR_API_TOKEN','REPAIR_API_U_HASH'];
for (const key of required) if (!process.env[key]) throw new Error('Missing ' + key);
let base = process.env.REPAIR_API_BASE.trim();
while (base.endsWith('/')) base = base.slice(0, -1);
if (new URL(base + '/api/v1/data').protocol !== 'https:') throw new Error('HTTPS required');

async function post(fields, label) {
  const response = await fetch(base + '/api/v1/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', Accept: 'application/json' },
    body: new URLSearchParams(fields), redirect: 'error', signal: AbortSignal.timeout(30000),
  });
  const raw = await response.text();
  let json; try { json = JSON.parse(raw); } catch { throw new Error(label + ': non-JSON HTTP ' + response.status); }
  if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') {
    throw new Error(label + ': HTTP ' + response.status + ', code ' + String(json?.code) + ', message ' + String(json?.message));
  }
  return json;
}
const auth = { token: process.env.REPAIR_API_TOKEN, u_hash: process.env.REPAIR_API_U_HASH };
const inventory = await post({ private: '1', fields: 'script_templates', ...auth }, 'Read templates');
const value = inventory?.data?.script_templates;
const records = Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
const current = records.find(item => item?.var === 'repair_api_test_page');
if (!current) throw new Error('repair_api_test_page not found; refusing to create');
if (String(current.only_admin) === '0') {
  console.log('NO_CHANGE: only_admin is already 0');
} else {
  if (String(current.only_admin) !== '1') throw new Error('Unexpected only_admin value; refusing to overwrite');
  const updatedRecord = { ...current, only_admin: '0' };
  const result = await post({ private: '1', data: JSON.stringify({ script_templates: [updatedRecord] }), ...auth }, 'Update template access');
  console.log('ACCESS_FLAG_UPDATE ' + JSON.stringify({ code: result.code, status: result.status, target: 'repair_api_test_page', only_admin: '0' }));
}
const verify = await post({ private: '1', fields: 'script_templates', ...auth }, 'Verify templates');
const afterValue = verify?.data?.script_templates;
const afterRecords = Array.isArray(afterValue) ? afterValue : afterValue && typeof afterValue === 'object' ? Object.values(afterValue) : [];
const after = afterRecords.find(item => item?.var === 'repair_api_test_page');
if (!after || String(after.only_admin) !== '0') throw new Error('Post-update verification failed');
console.log('ACCESS_FLAG_VERIFIED ' + JSON.stringify({ target: 'repair_api_test_page', only_admin: after.only_admin, record_id: after.id ?? null }));
