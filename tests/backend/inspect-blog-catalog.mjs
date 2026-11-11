#!/usr/bin/env node
// Read-only inspection of the public blog catalog. Does not create or modify data.
const required = ['REPAIR_API_BASE','BLOG_TEST_CLIENT_LOGIN','BLOG_TEST_CLIENT_PASSWORD'];
for (const key of required) if (!process.env[key]) throw new Error('Missing ' + key);
const base = process.env.REPAIR_API_BASE.replace(/\/+$/, '');
if (new URL(base).protocol !== 'https:') throw new Error('HTTPS required');
const api = base + '/api/v1/';
const endpoint = api + 'script/template/repair_api_comments_public/';
async function post(path, payload) {
  const r = await fetch(api + path, {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',Accept:'application/json'},body:new URLSearchParams(payload),redirect:'error',signal:AbortSignal.timeout(30000)});
  const j = await r.json();
  if (!r.ok || j?.status === 'error' || String(j?.code) !== '200') throw new Error(path + ' failed: HTTP ' + r.status + ', code=' + String(j?.code));
  return j.data ?? j;
}
const login = process.env.BLOG_TEST_CLIENT_LOGIN;
const auth = await post('auth',{login:login.includes('@')?login:login.trim().replace(/\D/g,''),password:process.env.BLOG_TEST_CLIENT_PASSWORD,type:login.includes('@')?'e-mail':'phone'});
const authHash = auth.auth_hash;
if (!authHash) throw new Error('auth_hash missing');
const tokenData = await post('token',{auth_hash:authHash,au:'f'});
const token = tokenData.token, uHash = tokenData.u_hash;
if (!token || !uHash) throw new Error('token/u_hash missing');
const response = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',Accept:'application/json'},body:new URLSearchParams({is_var:'1',s_t_data:JSON.stringify({action:'getBlogTopics'}),token,u_hash:uHash}),redirect:'error',signal:AbortSignal.timeout(30000)});
const json = await response.json();
if (!response.ok || json?.status === 'error' || String(json?.code) !== '200') throw new Error('getBlogTopics failed: HTTP '+response.status+', code='+String(json?.code));
const data = json.data;
const articles = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
if (!articles) { console.log('RAW_RESPONSE_SHAPE', JSON.stringify(json).slice(0,12000)); process.exit(0); }
console.log('ARTICLE_COUNT',articles.length);
for (const article of articles) {
  console.log('ARTICLE',JSON.stringify({
    id:article.id,title:article.title,slug:article.slug,topic:article.topic,topic_id:article.topic_id,topic_name:article.topic_name,
    category:article.category,categories:article.categories,
    author:article.author,author_id:article.author_id,author_name:article.author_name,
    keys:Object.keys(article)
  }));
}

// Trigger workflow registration after adding the workflow definition.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
execFileSync(process.execPath,['scripts/build-articles.mjs'],{stdio:'inherit'});
const catalog=JSON.parse(fs.readFileSync('public/articles/catalog.json','utf8'));
console.log('LOCAL_CATALOG_COUNT',catalog.articles.length);
for(const article of catalog.articles) console.log('LOCAL_ARTICLE',JSON.stringify({id:article.id,title:article.title,topic:article.topic,author:article.author}));
