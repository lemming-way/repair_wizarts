#!/usr/bin/env node
// Force template recreate by deleting and creating new record.
// This attempts to work around backend bug where UPDATE doesn't write PHP file.

const crypto = await import('node:crypto');
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

function hashContent(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

console.log('Backend host: ' + url.origin);

// Read template file
const fs = await import('node:fs/promises');
const file = await fs.readFile('script_templates/repair_api_test_page.php', 'utf8');
if (!file.startsWith('<?php')) throw new Error('Template source is not a PHP file.');
const localHash = hashContent(file);
console.log('Local template hash: ' + localHash.slice(0, 12));

// Find existing template
const inventory = await post({
  private: '1',
  fields: 'script_templates',
  ...auth,
}, 'Preflight read');

const recordsValue = inventory?.data?.script_templates;
if (recordsValue == null) throw new Error('Preflight did not return script_templates; refusing to write.');
const records = Array.isArray(recordsValue)
  ? recordsValue.map((item) => [item?.id_script_template ?? item?.id, item])
  : typeof recordsValue === 'object' ? Object.entries(recordsValue) : [];
const existingEntry = records.find(([, item]) => item && item.var === 'repair_api_test_page');
const existingId = existingEntry ? Number(existingEntry[0]) : null;
const existing = existingEntry?.[1] ?? null;

if (existing) {
  const serverHash = existing.hash || existing.file_hash || null;
  console.log('Existing template ID: ' + existingId);
  console.log('Server hash: ' + (serverHash?.slice(0, 12) || 'unknown'));
  
  // Try to delete the existing template first
  console.log('Attempting to delete existing template...');
  try {
    // Try delete via data endpoint with empty file or delete action
    const deletePayload = {
      script_templates: [{
        id: existingId,
        var: 'repair_api_test_page',
        file: '',  // Empty file might trigger delete
        _delete: true  // Try delete flag
      }],
    };
    await post({
      private: '1',
      data: JSON.stringify(deletePayload),
      ...auth,
    }, 'Template delete');
    console.log('Delete request accepted.');
    
    // Wait a bit for deletion to process
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.log('Delete failed (may not be supported): ' + e.message);
  }
  
  // Verify deletion
  const verifyInventory = await post({
    private: '1',
    fields: 'script_templates',
    ...auth,
  }, 'Verify deletion');
  const verifyRecords = verifyInventory?.data?.script_templates;
  let stillExists = false;
  if (Array.isArray(verifyRecords)) {
    stillExists = verifyRecords.some(item => item && item.var === 'repair_api_test_page');
  } else if (verifyRecords && typeof verifyRecords === 'object') {
    stillExists = Object.values(verifyRecords).some(item => item && item.var === 'repair_api_test_page');
  }
  
  if (stillExists) {
    console.log('Template still exists after delete attempt. Trying update with force flag...');
    // Try update with a force flag or different approach
    const updatePayload = {
      script_templates: [{
        id: existingId,
        var: 'repair_api_test_page',
        file: file,
        force_write: true  // Try to force file write
      }],
    };
    const updated = await post({
      private: '1',
      data: JSON.stringify(updatePayload),
      ...auth,
    }, 'Template force update');
    console.log('Force update response keys: ' + Object.keys(updated?.data || {}).join(', '));
  } else {
    console.log('Template deleted. Creating new record...');
    // Create new template
    const createPayload = {
      script_templates: [{
        var: 'repair_api_test_page',
        file: file,
      }],
    };
    const created = await post({
      private: '1',
      data: JSON.stringify(createPayload),
      ...auth,
    }, 'Template creation');
    console.log('Creation response keys: ' + Object.keys(created?.data || {}).join(', '));
  }
} else {
  console.log('Template does not exist; creating new record...');
  const createPayload = {
    script_templates: [{
      var: 'repair_api_test_page',
      file: file,
    }],
  };
  const created = await post({
    private: '1',
    data: JSON.stringify(createPayload),
    ...auth,
  }, 'Template creation');
  console.log('Creation response keys: ' + Object.keys(created?.data || {}).join(', '));
}

console.log('Done.');