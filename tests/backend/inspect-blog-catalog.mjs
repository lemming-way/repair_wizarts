#!/usr/bin/env node
// Read-only comparison of article template availability across roles.
// Sends s_t_data only (intentionally no is_var). No business data is modified.
const required = [
  'REPAIR_API_BASE',
  'BLOG_TEST_CLIENT_LOGIN',
  'BLOG_TEST_CLIENT_PASSWORD',
  'BLOG_TEST_MASTER_LOGIN',
  'BLOG_TEST_MASTER_PASSWORD',
];
for (const key of required) {
  if (!process.env[key]) throw new Error('Missing ' + key);
}
const base = process.env.REPAIR_API_BASE.replace(/\\/+$/, '');
if (new URL(base).protocol !== 'https:') throw new Error('HTTPS required');
const api = base + '/api/v1/';
const templates = [
  'repair_api_test_page',
  'repair_api_comments_public',
  'repair_api',
];
async function apiPost(path, payload) {
  const response = await fetch(api + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Accept: 'application/json',
    },
    body: new URLSearchParams(payload),
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  const raw = await response.text();
  let json;
  try { json = JSON.parse(raw); } catch {
    return { http_status: response.status, raw_body: raw };
  }
  return { http_status: response.status, json };
}
async function getToken(login, password, roleLabel) {
  const normalizedLogin = login.includes('@') ? login : login.trim().replace(/\\D/g, '');
  const authResult = await apiPost('auth', {
    login: normalizedLogin,
    password,
    type: login.includes('@') ? 'e-mail' : 'phone',
  });
  const auth = authResult.json?.data ?? authResult.json;
  if (!auth?.auth_hash) {
    console.log('AUTH_FAILURE', JSON.stringify({
      role: roleLabel,
      response: authResult,
    }));
    return null;
  }
  const tokenResult = await apiPost('token', { auth_hash: auth.auth_hash, au: 'f' });
  const tokenData = tokenResult.json?.data ?? tokenResult.json;
  if (!tokenData?.token || !tokenData?.u_hash) {
    console.log('TOKEN_FAILURE', JSON.stringify({
      role: roleLabel,
      response: tokenResult,
    }));
    return null;
  }
  return { token: tokenData.token, u_hash: tokenData.u_hash };
}
const roles = [
  {
    label: 'client',
    login: process.env.BLOG_TEST_CLIENT_LOGIN,
    password: process.env.BLOG_TEST_CLIENT_PASSWORD,
  },
  {
    label: 'master',
    login: process.env.BLOG_TEST_MASTER_LOGIN,
    password: process.env.BLOG_TEST_MASTER_PASSWORD,
  },
];
for (const role of roles) {
  const credentials = await getToken(role.login, role.password, role.label);
  if (!credentials) continue;
  for (const template of templates) {
    const endpoint = 'script/template/' + template + '/';
    const result = await apiPost(endpoint, {
      s_t_data: JSON.stringify({ action: 'getBlogTopics' }),
      token: credentials.token,
      u_hash: credentials.u_hash,
    });
    console.log('TEMPLATE_RESULT', JSON.stringify({
      role: role.label,
      template,
      request_fields: ['s_t_data', 'token', 'u_hash'],
      http_status: result.http_status,
      response: result.json ?? result.raw_body,
    }));
  }
}
