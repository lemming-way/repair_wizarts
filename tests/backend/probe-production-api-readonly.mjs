#!/usr/bin/env node
const required=['REPAIR_API_TOKEN','REPAIR_API_U_HASH'];
for(const k of required) if(!process.env[k]) throw new Error('Missing '+k);
const base='https://ibronevik.ru/taxi/c/tutor';
const url=base+'/api/v1/data';
const form=new URLSearchParams({private:'1',fields:'script_templates',token:process.env.REPAIR_API_TOKEN,u_hash:process.env.REPAIR_API_U_HASH});
const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',Accept:'application/json'},body:form,redirect:'error',signal:AbortSignal.timeout(30000)});
const raw=await response.text(); let json; try{json=JSON.parse(raw)}catch{throw new Error('Production API returned non-JSON HTTP '+response.status)}
console.log('PRODUCTION_API_HTTP '+response.status);
console.log('PRODUCTION_API_CODE '+String(json?.code??'n/a'));
console.log('PRODUCTION_API_STATUS '+String(json?.status??'n/a'));
console.log('PRODUCTION_API_MESSAGE '+String(json?.message??'').slice(0,250));
if(!response.ok||json?.status==='error'||String(json?.code)!=='200') process.exitCode=2;
else console.log('PRODUCTION_API_READ_AUTH_OK');
