#!/usr/bin/env node
// Create a separate public endpoint limited to article/comment actions.
// Existing admin-only templates are never modified.
import fs from 'node:fs/promises';

const required = ['REPAIR_API_BASE', 'REPAIR_API_TOKEN', 'REPAIR_API_U_HASH'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error('Missing required GitHub Actions secrets: ' + missing.join(', '));

const base = process.env.REPAIR_API_BASE.replace(/\/+$/, '');
const endpoint = base + '/api/v1/data';
if (new URL(base).protocol !== 'https:') throw new Error('HTTPS is required.');
const auth = { token: process.env.REPAIR_API_TOKEN, u_hash: process.env.REPAIR_API_U_HASH };
const templateVar = 'repair_api_comments_public';

async function post(fields, label) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', Accept: 'application/json' },
    body: new URLSearchParams(fields),
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  let json;
  try { json = await response.json(); }
  catch { throw new Error(label + ': non-JSON HTTP ' + response.status); }
  if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') {
    throw new Error(label + ': HTTP ' + response.status + ', code ' +
      String(json?.code ?? 'n/a') + ', message ' + String(json?.message ?? 'not provided').slice(0, 300));
  }
  return json;
}
async function readInventory() {
  const json = await post({ private: '1', fields: 'script_templates', ...auth }, 'Template inventory');
  const value = json?.data?.script_templates;
  if (value == null) throw new Error('Template inventory did not return script_templates');
  return Array.isArray(value) ? value : Object.values(value);
}

const records = await readInventory();
const existing = records.find((item) => item?.var === templateVar);
if (existing) {
  if (String(existing.only_admin) === '0') {
    console.log('NO-OP: public comments template already exists with only_admin=0.');
    process.exit(0);
  }
  throw new Error('A template with the public comments name already exists but is not public; refusing to overwrite it.');
}

const file = await fs.readFile('script_templates/repair_api_comments_public.php', 'utf8');
if (!file.startsWith('<?php')) throw new Error('Public comments template source is not PHP.');
if (!file.includes('Action is not available in the public comments template.')) {
  throw new Error('Public action allowlist is missing.');
}
console.log('Creating isolated public comments template with only_admin=0.');
await post({
  private: '1',
  data: JSON.stringify({
    script_templates: [{ var: templateVar, file, only_admin: 0 }]
  }),
  ...auth,
}, 'Public comments template creation');

const verified = await readInventory();
const created = verified.find((item) => item?.var === templateVar);
if (!created || String(created.only_admin) !== '0') {
  throw new Error('Post-create verification failed: public comments template is missing or still admin-only.');
}
console.log('PASS: public comments template created and verified; only_admin=0.');
console.log('Allowed actions: getBlogTopics, getBlogTopicById, getBlogPosts, addBlogPost.');
