#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const required=['REPAIR_API_BASE','REPAIR_API_TOKEN','REPAIR_API_U_HASH'];
for(const key of required) if(!process.env[key]) throw new Error('Missing '+key);
const base=process.env.REPAIR_API_BASE.replace(/\/+$/,'');
const origin=new URL(base).origin;
if(new URL(base).protocol!=='https:') throw new Error('HTTPS is required');
const apiBase=base+'/api/v1';
const auth={token:process.env.REPAIR_API_TOKEN,u_hash:process.env.REPAIR_API_U_HASH};

async function post(path,fields,label){
  const form=fields instanceof FormData?fields:new URLSearchParams(fields);
  if(form instanceof FormData){form.set('token',auth.token);form.set('u_hash',auth.u_hash);}
  else {form.set('token',auth.token);form.set('u_hash',auth.u_hash);}
  const response=await fetch(apiBase+path,{method:'POST',headers:{Accept:'application/json'},body:form,redirect:'error',signal:AbortSignal.timeout(60000)});
  const raw=await response.text(); let json;
  try{json=JSON.parse(raw)}catch{throw new Error(label+' returned non-JSON HTTP '+response.status+': '+raw.slice(0,250))}
  if(!response.ok||json?.status==='error'||String(json?.code)!=='200') {
    throw new Error(label+' failed HTTP '+response.status+', code '+String(json?.code??'n/a')+', message '+(typeof json?.message==='object'?JSON.stringify(json.message):String(json?.message??'')).slice(0,1000));
  }
  return json;
}
function dataOf(json){return json?.data?.data??json?.data??json;}
function apiFields(action,fields={}){return {is_var:'1',s_t_data:JSON.stringify({action,...fields})};}
function hash(s){return crypto.createHash('sha256').update(s).digest('hex');}

const source=fs.readFileSync('script_templates/repair_api.php','utf8');
const helper=fs.readFileSync('script_templates/blog_import_actions.php','utf8').replace(/^\s*<\?php\s*/,'');
const includeLine="require_once __DIR__ . '/blog_import_actions.php';";
if(source.split(includeLine).length!==2) throw new Error('Expected exactly one helper include in repair_api.php');
const deployedSource=source.replace(includeLine,helper);
if(deployedSource.includes(includeLine)||deployedSource.length<source.length+20000) throw new Error('Combined PHP deployment source validation failed');

const inventoryJson=await post('/data',{private:'1',fields:'script_templates'},'Template inventory read');
const inventory=dataOf(inventoryJson)?.script_templates;
const records=Array.isArray(inventory)?inventory:inventory&&typeof inventory==='object'?Object.values(inventory):[];
const matches=records.filter(x=>x?.var==='repair_api'&&typeof x.file==='string');
if(matches.length!==1) throw new Error('Expected exactly one existing repair_api template, found '+matches.length);
const original={...matches[0],id_script_template:1};
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/repair_api.before-import-e2e.php',original.file,'utf8');
console.log('BACKUP_SHA256 '+hash(original.file));
console.log('TARGET_API_ORIGIN '+origin);
console.log('CURRENT_REPAIR_API_LENGTH '+original.file.length);
console.log('NEW_REPAIR_API_LENGTH '+deployedSource.length);

async function updateTemplate(file,label){
  const update=await post('/data',{private:'1',data:JSON.stringify({script_templates:[{...original,file}]})},label);
  const checkJson=await post('/data',{private:'1',fields:'script_templates'},label+' readback');
  const currentValue=dataOf(checkJson)?.script_templates;
  const currentRecords=Array.isArray(currentValue)?currentValue:currentValue&&typeof currentValue==='object'?Object.values(currentValue):[];
  const current=currentRecords.find(x=>x?.var==='repair_api');
  if(!current||current.file!==file) throw new Error(label+' readback hash mismatch');
  return update;
}

let deployed=false;
try {
  await updateTemplate(deployedSource,'Deploy combined repair_api template');
  deployed=true;
  console.log('BACKEND_TEMPLATE_DEPLOYED '+hash(deployedSource));

  const topicsJson=await post('/script/template/repair_api/',apiFields('getBlogTopics'),'Public article list');
  const articles=dataOf(topicsJson);
  if(!Array.isArray(articles)) throw new Error('getBlogTopics did not return an article array');
  const qaTitle='Проверка реального импорта: электрический чайник не включается [QA 2026-11-07]';
  const qa=articles.find(x=>String(x.title||'')===qaTitle&&Number(x.id)===7);
  if(!qa) throw new Error('Safety stop: the pre-existing QA article ID 7 was not found in this API database; no article import attempted.');
  console.log('PREEXISTING_QA_ARTICLE '+JSON.stringify({id:Number(qa.id),title:qa.title,topic_id:qa.topic_id}));

  const zipPath='docs/regression/v1.3/electric_kettle.zip';
  const python=String.raw`import io,json,sys,zipfile
src,title=sys.argv[1],sys.argv[2]
out=io.BytesIO()
with zipfile.ZipFile(src,'r') as zin:
    entries={name:zin.read(name) for name in zin.namelist()}
if 'article.json' not in entries:
    raise SystemExit('Fixture lacks article.json')
article=json.loads(entries['article.json'].decode('utf-8-sig'))
article['title']=title
entries['article.json']=json.dumps(article,ensure_ascii=False,separators=(',',':')).encode('utf-8')
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED) as zout:
    for name,data in entries.items():
        zout.writestr(name,data)
sys.stdout.buffer.write(out.getvalue())`;
  const zipBytes=execFileSync('python3',['-c',python,zipPath,qaTitle],{maxBuffer:100*1024*1024});
  const articleJson=execFileSync('python3',['-c',"import sys,zipfile;print(zipfile.ZipFile(sys.argv[1]).read('article.json').decode('utf-8-sig'))",zipPath],{encoding:'utf8'});
  const article=JSON.parse(articleJson);
  article.title=qaTitle;
  const upload=new FormData();
  upload.set('is_var','1');
  upload.set('s_t_data',JSON.stringify({action:'validateBlogImport'}));
  upload.set('archive',new Blob([zipBytes],{type:'application/zip'}),'electric_kettle_qa.zip');
  const validatedJson=await post('/script/template/repair_api/',upload,'Validate ZIP through repair_api');
  const validated=dataOf(validatedJson);
  if(!validated?.token||validated?.article?.title!==qaTitle||!Array.isArray(validated.preview_assets)||!validated.preview_assets.length) {
    throw new Error('ZIP validation response is incomplete: '+JSON.stringify({token:!!validated?.token,title:validated?.article?.title,assets:validated?.preview_assets?.length}));
  }
  console.log('ZIP_VALIDATION_OK '+JSON.stringify({title:validated.article.title,format_version:validated.article.format_version,assets:validated.preview_assets.length,token_bound:true}));

  const previewJson=await post('/script/template/repair_api/',apiFields('previewBlogImport',{token:validated.token}),'Preview token');
  const preview=dataOf(previewJson);
  if(preview?.article?.title!==qaTitle||!Array.isArray(preview.preview_assets)||preview.preview_assets.length!==validated.preview_assets.length) {
    throw new Error('Preview token readback mismatch');
  }
  console.log('PREVIEW_TOKEN_OK '+preview.preview_assets.length+' assets');

  const importedJson=await post('/script/template/repair_api/',apiFields('importBlogPost',{token:validated.token,mode:'update_only'}),'Import QA article via PHP importer');
  const imported=dataOf(importedJson);
  if(imported?.action!=='updated'||Number(imported?.id)!==7||imported?.status!=='published'||!String(imported?.media_base_url||'').startsWith('/')) {
    throw new Error('Unexpected importer result: '+JSON.stringify(imported));
  }
  console.log('PHP_IMPORT_RESULT '+JSON.stringify(imported));

  const afterJson=await post('/script/template/repair_api/',apiFields('getBlogTopics'),'Verify public article list');
  const after=dataOf(afterJson);
  const saved=Array.isArray(after)?after.find(x=>Number(x.id)===7):null;
  if(!saved||saved.title!==qaTitle) throw new Error('Updated QA article is not visible in public article list');
  console.log('PUBLIC_READBACK_OK '+JSON.stringify({id:saved.id,title:saved.title}));

  const mediaFile=article.assets[0]?.file?.split('/').pop();
  if(!mediaFile) throw new Error('No media asset available for HTTP verification');
  const mediaUrl=new URL(imported.media_base_url+mediaFile,origin);
  const mediaResponse=await fetch(mediaUrl,{method:'GET',redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!mediaResponse.ok) throw new Error('Uploaded media URL returned HTTP '+mediaResponse.status+' ('+mediaUrl.pathname+')');
  const mediaBytes=await mediaResponse.arrayBuffer();
  if(mediaBytes.byteLength===0) throw new Error('Uploaded media file is empty');
  console.log('MEDIA_HTTP_READBACK_OK '+JSON.stringify({status:mediaResponse.status,bytes:mediaBytes.byteLength,content_type:mediaResponse.headers.get('content-type')}));
  console.log('IMPORTER_API_E2E_PASS');
} catch(error) {
  if(deployed) {
    try {
      await updateTemplate(original.file,'Restore previous repair_api template after failed E2E');
      console.log('BACKEND_TEMPLATE_RESTORED');
    } catch(restoreError) {
      console.error('CRITICAL: automatic backend template restore failed: '+String(restoreError));
    }
  }
  throw error;
}
