#!/usr/bin/env node
import crypto from 'node:crypto';
const required=['REPAIR_API_BASE','REPAIR_API_TOKEN','REPAIR_API_U_HASH'];
for(const k of required) if(!process.env[k]) throw new Error('Missing '+k);
const base=process.env.REPAIR_API_BASE.replace(/\/+$/,'');
const url=new URL(base+'/api/v1/data');
if(url.protocol!=='https:') throw new Error('HTTPS required');
const form=new URLSearchParams({private:'1',fields:'script_templates',token:process.env.REPAIR_API_TOKEN,u_hash:process.env.REPAIR_API_U_HASH});
const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',Accept:'application/json'},body:form,redirect:'error',signal:AbortSignal.timeout(30000)});
const raw=await response.text();
let json;try{json=JSON.parse(raw)}catch{throw new Error('Inventory returned non-JSON HTTP '+response.status)}
if(!response.ok||json?.status==='error'||String(json?.code)!=='200') throw new Error('Inventory failed HTTP '+response.status+' code '+String(json?.code));
const value=json?.data?.script_templates;
const records=Array.isArray(value)?value:value&&typeof value==='object'?Object.values(value):[];
const selected=records.filter(x=>x&&['repair_api','blog_import_actions','repair_api_test_page'].includes(x.var));
console.log('API_ORIGIN '+url.origin);
console.log('TEMPLATE_INVENTORY '+JSON.stringify(selected.map(x=>({var:x.var,has_file:typeof x.file==='string',length:typeof x.file==='string'?x.file.length:0,sha256:typeof x.file==='string'?crypto.createHash('sha256').update(x.file).digest('hex'):null}))));
