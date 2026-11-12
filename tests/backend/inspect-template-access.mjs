#!/usr/bin/env node
// Read-only comparison of backend template access metadata. Never prints PHP source or credentials.
const required = ['REPAIR_API_BASE','REPAIR_API_TOKEN','REPAIR_API_U_HASH'];
for (const key of required) if (!process.env[key]) throw new Error('Missing ' + key);
const base = process.env.REPAIR_API_BASE.replace(/\/+$/, '');
if (new URL(base + '/api/v1/data').protocol !== 'https:') throw new Error('HTTPS required');
const form = new URLSearchParams({ private: '1', fields: 'script_templates',
  token: process.env.REPAIR_API_TOKEN, u_hash: process.env.REPAIR_API_U_HASH });
const response = await fetch(base + '/api/v1/data', { method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', Accept: 'application/json' },
  body: form, redirect: 'error', signal: AbortSignal.timeout(30000) });
const raw = await response.text();
let json; try { json = JSON.parse(raw); } catch { throw new Error('Non-JSON inventory response, HTTP ' + response.status); }
if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') {
  throw new Error('Inventory rejected: HTTP ' + response.status + ', code ' + String(json?.code) + ', message ' + String(json?.message));
}
const value = json?.data?.script_templates;
const records = Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
for (const name of ['repair_api_test_page','repair_api_comments_public','repair_api']) {
  const record = records.find(item => item?.var === name);
  if (!record) { console.log('TEMPLATE_METADATA ' + JSON.stringify({name,found:false})); continue; }
  const metadata = {};
  for (const [key,val] of Object.entries(record)) {
    if (key === 'file' || /token|password|secret|hash/i.test(key)) continue;
    if (/role|access|right|permission|public|private|active|status|owner|user|group|type|var|id/i.test(key)) metadata[key] = val;
  }
  console.log('TEMPLATE_METADATA ' + JSON.stringify({name,found:true,keys:Object.keys(record).filter(k=>k!=='file'),metadata}));
}
