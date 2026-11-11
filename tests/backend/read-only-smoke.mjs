#!/usr/bin/env node

/**
 * Read-only connectivity and authorization check for the tutor API.
 *
 * Required environment:
 *   REPAIR_API_BASE  Base URL without trailing slash, e.g.
 *                    https://ibronevik.itest24.com/taxi_dev2/c/tutor
 *   REPAIR_API_TOKEN
 *   REPAIR_API_U_HASH
 *
 * This test only reads script_templates. It does not create, update, execute,
 * or delete templates and does not print credentials or response contents.
 */

async function main() {
const required = ['REPAIR_API_BASE', 'REPAIR_API_TOKEN', 'REPAIR_API_U_HASH'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(2);
}

const base = process.env.REPAIR_API_BASE.replace(/\/+$/, '');
let parsedBase;

try {
  parsedBase = new URL(base);
} catch {
  console.error('REPAIR_API_BASE is not a valid URL.');
  process.exit(2);
}

if (parsedBase.protocol !== 'https:') {
  console.error('Refusing to send credentials over a non-HTTPS connection.');
  process.exit(2);
}

const endpoint = `${base}/api/v1/data`;
// Match the frontend request.ts implementation: each property is a
// separate form field. Do not wrap these parameters in a JSON "data" field.
const form = new URLSearchParams({
  private: '1',
  fields: 'script_templates',
  token: process.env.REPAIR_API_TOKEN,
  u_hash: process.env.REPAIR_API_U_HASH,
});

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 20000);

try {
  console.log(`Backend: ${parsedBase.origin}`);
  console.log('Operation: read script_templates (no writes)');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Accept': 'application/json',
    },
    body: form,
    signal: controller.signal,
    redirect: 'error',
  });

  const raw = await response.text();
  let result;

  try {
    result = JSON.parse(raw);
  } catch {
    console.error(`FAIL: backend returned non-JSON content (HTTP ${response.status}).`);
    console.error(`Content-Type: ${response.headers.get('content-type') || 'not set'}`);
    process.exitCode = 1;
    // Never print raw body: it may contain session or account information.
    return;
  }

  console.log(`HTTP status: ${response.status}`);
  console.log(`API status: ${result?.status ?? 'not provided'}`);
  console.log(`API code: ${result?.code ?? 'not provided'}`);

  if (!response.ok || result?.status === 'error' || result?.code !== '200') {
    console.error('FAIL: backend rejected the read request.');
    console.error(`API message: ${String(result?.message ?? 'not provided').slice(0, 300)}`);
    process.exitCode = 1;
    return;
  }

  const data = result?.data;
  const templates = data?.script_templates;

  if (templates === undefined || templates === null) {
    console.error('FAIL: request succeeded, but script_templates was not present in response data.');
    console.error(`Returned data keys: ${data && typeof data === 'object' ? Object.keys(data).join(', ') : 'no object'}`);
    process.exitCode = 1;
    return;
  }

  const count = Array.isArray(templates)
    ? templates.length
    : typeof templates === 'object'
      ? Object.keys(templates).length
      : 'unknown';

  console.log('PASS: authenticated read of script_templates succeeded.');
  console.log(`Template records returned: ${count}`);

  // Print only identifying metadata needed for a safe inventory. Never print
  // template source, credentials, or arbitrary response values.
  const records = Array.isArray(templates)
    ? templates
    : typeof templates === 'object'
      ? Object.values(templates)
      : [];
  const safeFields = ['var', 'name', 'filename', 'file_name', 'title', 'id', 'only_admin'];
  let foundTestVar = false;
  let foundTestPageVar = false;

  for (const [index, record] of records.entries()) {
    if (!record || typeof record !== 'object') {
      console.log(`Template[${index}]: non-object record`);
      continue;
    }
    const metadata = {};
    for (const key of safeFields) {
      if (record[key] !== undefined && ['string', 'number', 'boolean'].includes(typeof record[key])) {
        metadata[key] = String(record[key]).slice(0, 160);
      }
    }
    if (metadata.var === 'repair_api_test') foundTestVar = true;
    if (metadata.var === 'repair_api_test_page') foundTestPageVar = true;
    console.log(`Template[${index}] metadata: ${JSON.stringify(metadata)}`);
    console.log(`Template[${index}] fields: ${Object.keys(record).sort().join(', ')}`);

    // The API exposes a "file" field, but it may contain PHP source rather
    // than a filename. Report only its shape and a safe filename if obvious.
    const fileValue = record.file;
    if (typeof fileValue === 'string') {
      const trimmed = fileValue.trim();
      const isSafeFilename = /^[A-Za-z0-9_.-]+\\.php$/i.test(trimmed);
      console.log(`Template[${index}] file field: string, ${Buffer.byteLength(fileValue, 'utf8')} bytes`);
      if (isSafeFilename) {
        console.log(`Template[${index}] file filename: ${trimmed}`);
      } else {
        console.log(`Template[${index}] file field appears to contain content or a non-filename value; source not printed`);
      }
    } else {
      console.log(`Template[${index}] file field type: ${fileValue === null ? 'null' : typeof fileValue}`);
    }
  }

  console.log(`repair_api_test var already present: ${foundTestVar ? 'yes' : 'no'}`);
  console.log(`repair_api_test_page var present: ${foundTestPageVar ? 'yes' : 'no'}`);
  if (!foundTestPageVar) process.exitCode = 1;
} catch (error) {
  const message = error?.name === 'AbortError'
    ? 'request timed out after 20 seconds'
    : error?.cause?.code || error?.code || error?.message || 'unknown network error';

  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}

}

main().catch((error) => {
  console.error(`FAIL: ${error?.message || 'unexpected test runner error'}`);
  process.exitCode = 1;
});
