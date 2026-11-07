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

const source=fs.readFileSync('script_templates/repair_api_test_page.php','utf8');
const helper=fs.readFileSync('script_templates/blog_import_actions.php','utf8').replace(/^\\s*<\\?php\\s*/,'');
const contextAnchor="\\n  try {\\n    // Получаем контекст";
const dispatchAnchor="    default:\\n      $die(400, 'Unknown action.');";
const importActions=`    case 'validateBlogImport':
      $blog_import_admin($context);
      if (!isset($context['files']['archive'])) $die(400, 'ZIP archive missing.');
      return $blog_import_validate($context['files']['archive'], $context['u_id']);

    case 'previewBlogImport':
      $blog_import_admin($context);
      return $blog_import_preview(isset($data['token']) ? $data['token'] : '', $context['u_id']);

    case 'importBlogPost':
      $blog_import_admin($context);
      return $blog_import_save(
        isset($data['token']) ? $data['token'] : '',
        isset($data['mode']) ? $data['mode'] : '',
        $context
      );

`;
if(source.split(contextAnchor).length!==2) throw new Error('Test template context insertion point is not unique');
if(source.split(dispatchAnchor).length!==2) throw new Error('Test template action dispatch insertion point is not unique');
let deployedSource=source.replace(contextAnchor, "\\n"+helper+"\\n"+contextAnchor);
deployedSource=deployedSource.replace(dispatchAnchor, importActions+dispatchAnchor);
if(deployedSource.length<source.length+20000 || !deployedSource.includes("case 'validateBlogImport'")) throw new Error('Combined test template validation failed');
const templateVar='repair_api_test_page';
const templateId=2;

const inventoryJson=await post('/data',{private:'1',fields:'script_templates'},'Template inventory read');
const inventory=dataOf(inventoryJson)?.script_templates;
const records=Array.isArray(inventory)?inventory:inventory&&typeof inventory==='object'?Object.values(inventory):[];
const matches=records.filter(x=>x?.var===templateVar&&typeof x.file==='string');
if(matches.length!==1) throw new Error('Expected exactly one existing '+templateVar+' template, found '+matches.length);
const original={...matches[0],id:templateId,id_script_template:templateId};
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/repair_api_test_page.before-import-e2e.php',original.file,'utf8');
console.log('TEST_TEMPLATE_BACKUP_SHA256 '+hash(original.file));
console.log('TARGET_API_ORIGIN '+origin);
console.log('CURRENT_TEST_TEMPLATE_LENGTH '+original.file.length);
console.log('NEW_TEST_TEMPLATE_LENGTH '+deployedSource.length);

async function updateTemplate(file,label){
  const update=await post('/data',{private:'1',data:JSON.stringify({script_templates:[{...original,file}]})},label);
  const checkJson=await post('/data',{private:'1',fields:'script_templates'},label+' readback');
  const currentValue=dataOf(checkJson)?.script_templates;
  const currentRecords=Array.isArray(currentValue)?currentValue:currentValue&&typeof currentValue==='object'?Object.values(currentValue):[];
  const current=currentRecords.find(x=>x?.var===templateVar);
  if(!current||current.file!==file) throw new Error(label+' readback hash mismatch');
  return update;
}

let deployed=false;
try {
  await updateTemplate(deployedSource,'Deploy combined repair_api_test_page template');
  deployed=true;
  console.log('TEST_TEMPLATE_DEPLOYED '+hash(deployedSource));

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
  const qaTitle='Проверка панели импорта: электрический чайник [QA 2026-11-07]';
  const zipBytes=execFileSync('python3',['-c',python,zipPath,qaTitle],{maxBuffer:100*1024*1024});
  const upload=new FormData();
  upload.set('is_var','1');
  upload.set('s_t_data',JSON.stringify({action:'validateBlogImport'}));
  upload.set('archive',new Blob([zipBytes],{type:'application/zip'}),'electric_kettle_panel_qa.zip');
  const endpoint='/script/template/repair_api_test_page/';
  const validatedJson=await post(endpoint,upload,'Validate ZIP through repair_api_test_page');
  const validated=dataOf(validatedJson);
  if(!validated?.token||validated?.article?.title!==qaTitle||!Array.isArray(validated.preview_assets)||!validated.preview_assets.length) {
    throw new Error('ZIP validation response is incomplete: '+JSON.stringify({token:!!validated?.token,title:validated?.article?.title,assets:validated?.preview_assets?.length}));
  }
  console.log('TEST_TEMPLATE_ZIP_VALIDATION_OK '+JSON.stringify({title:validated.article.title,format_version:validated.article.format_version,assets:validated.preview_assets.length,token_bound:true}));

  const previewJson=await post(endpoint,apiFields('previewBlogImport',{token:validated.token}),'Preview token through repair_api_test_page');
  const preview=dataOf(previewJson);
  if(preview?.article?.title!==qaTitle||!Array.isArray(preview.preview_assets)||preview.preview_assets.length!==validated.preview_assets.length) {
    throw new Error('Preview token readback mismatch');
  }
  console.log('TEST_TEMPLATE_PREVIEW_OK '+JSON.stringify({title:preview.article.title,assets:preview.preview_assets.length,warnings:preview.warnings||[]}));
  console.log('TEST_TEMPLATE_VALIDATE_PREVIEW_PASS');

} catch(error) {
  if(deployed) {
    try {
      await updateTemplate(original.file,'Restore previous repair_api_test_page template after failed test');
      console.log('TEST_TEMPLATE_RESTORED');
    } catch(restoreError) {
      console.error('CRITICAL: automatic backend template restore failed: '+String(restoreError));
    }
  }
  throw error;
}
