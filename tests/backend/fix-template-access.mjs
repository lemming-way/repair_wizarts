#!/usr/bin/env node
// Change only repair_api_test_page.only_admin from 1 to 0; preserve its PHP and all other metadata.
const required = ['REPAIR_API_BASE','REPAIR_API_TOKEN','REPAIR_API_U_HASH',
  'E2E_CLIENT_1_LOGIN','E2E_CLIENT_1_PASSWORD','E2E_MASTER_1_LOGIN','E2E_MASTER_1_PASSWORD'];
for (const key of required) if (!process.env[key]) throw new Error('Missing required environment: ' + key);
let base = process.env.REPAIR_API_BASE.trim();
while (base.endsWith('/')) base = base.slice(0, -1);
if (new URL(base + '/api/v1/data').protocol !== 'https:') throw new Error('HTTPS required');
const api = base + '/api/v1/';
const admin = { token: process.env.REPAIR_API_TOKEN, u_hash: process.env.REPAIR_API_U_HASH };
async function post(path, payload, label) {
  const response = await fetch(api + path, { method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',Accept:'application/json'},
    body:new URLSearchParams(payload), redirect:'error', signal:AbortSignal.timeout(30000) });
  const raw=await response.text(); let json;
  try { json=JSON.parse(raw); } catch { throw new Error(label+' returned non-JSON HTTP '+response.status); }
  if (!response.ok || json?.status==='error' || String(json?.code)!=='200')
    throw new Error(label+' rejected: HTTP '+response.status+', code '+String(json?.code)+', message '+String(json?.message));
  return json;
}
async function inventory() {
  const result=await post('data',{private:'1',fields:'script_templates',...admin},'Template inventory');
  const value=result?.data?.script_templates;
  const records=Array.isArray(value)?value.map((item,index)=>({key:String(index),item})):
    value&&typeof value==='object'?Object.entries(value).map(([key,item])=>({key,item})):[];
  const entry=records.find(({item})=>item?.var==='repair_api_test_page');
  if(!entry) throw new Error('repair_api_test_page not found');
  return entry;
}
let entry=await inventory();
if (entry.key!=='2') throw new Error('Unexpected numeric template ID '+entry.key+'; refusing to update');
if (String(entry.item.only_admin)==='1') {
  const updated={...entry.item,only_admin:'0'};
  await post('data',{private:'1',data:JSON.stringify({script_templates:[updated]}),...admin},'Template permission update');
}
entry=await inventory();
if (String(entry.item.only_admin)!=='0') throw new Error('only_admin did not persist as 0');
console.log('TEMPLATE_PERMISSION_UPDATED '+JSON.stringify({template:'repair_api_test_page',id:entry.key,only_admin:entry.item.only_admin}));
async function userToken(login,password,label) {
  const normalized=login.includes('@')?login:login.trim().replace(/\\D/g,'');
  const auth=await post('auth',{login:normalized,password,type:login.includes('@')?'e-mail':'phone'},label+' auth');
  const authData=auth?.data??auth;
  if(!authData?.auth_hash) throw new Error(label+' authentication did not return auth_hash');
  const token=await post('token',{auth_hash:authData.auth_hash,au:'f'},label+' token');
  const td=token?.data??token;
  if(!td?.token||!td?.u_hash) throw new Error(label+' token response incomplete');
  return {token:td.token,u_hash:td.u_hash};
}
for (const role of [
  {label:'client',login:process.env.E2E_CLIENT_1_LOGIN,password:process.env.E2E_CLIENT_1_PASSWORD},
  {label:'master',login:process.env.E2E_MASTER_1_LOGIN,password:process.env.E2E_MASTER_1_PASSWORD}
]) {
  const credentials=await userToken(role.login,role.password,role.label);
  for (const mode of [{path:'script/template/2/',is_var:false},{path:'script/template/repair_api_test_page/',is_var:true}]) {
    const payload={s_t_data:JSON.stringify({action:'getBlogTopics'}),...credentials};
    if(mode.is_var) payload.is_var='1';
    const result=await post(mode.path,payload,role.label+' '+mode.path);
    const data=result?.data?.data??result?.data;
    const count=Array.isArray(data?.topics)?data.topics.length:Array.isArray(data)?data.length:null;
    console.log('TEMPLATE_ACCESS_TEST '+JSON.stringify({role:role.label,path:mode.path,is_var:mode.is_var?'1':'omitted',api_code:result.code,topic_count:count}));
  }
}
