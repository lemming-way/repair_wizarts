import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
const required=['MYSQL_HOST','MYSQL_DATABASE','MYSQL_USER','MYSQL_PASSWORD','REPAIR_API_BASE','REPAIR_API_TOKEN','REPAIR_API_U_HASH'];
for(const k of required) if(!process.env[k]?.trim()) throw new Error('Missing secret: '+k);
const base=process.env.REPAIR_API_BASE.trim().replace(/\/$/,'');
const u=new URL(base);
if(u.protocol!=='https:'||u.hostname!=='ibronevik.itest24.com'||!u.pathname.includes('/taxi_dev2/c/tutor')) throw new Error('Refusing non-test API base');
if(process.env.MYSQL_DATABASE!=='aristotel_tutor') throw new Error('Refusing non-test database');
const db=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE,connectTimeout:15000,multipleStatements:false,...(process.env.MYSQL_SSL==='true'?{ssl:{rejectUnauthorized:true}}:{})});
const auth={token:process.env.REPAIR_API_TOKEN,u_hash:process.env.REPAIR_API_U_HASH};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const src={
 'media/cover.svg':{url:'https://raw.githubusercontent.com/lemming-way/repair_wizarts/docs/repair-wizards-article-format-v1.3/docs/regression/v1.3/electric_kettle/media/cover.svg',name:'cover.svg',size:529,mime:'image/svg+xml'},
 'media/terminal_layout.svg':{url:'https://raw.githubusercontent.com/lemming-way/repair_wizarts/docs/repair-wizards-article-format-v1.3/docs/regression/v1.3/electric_kettle/media/terminal_layout.svg',name:'terminal_layout.svg',size:521,mime:'image/svg+xml'}
};
async function verify(id,bytes,mime,digest){
 const r=await fetch(base+'/api/v1/dropbox/file/'+id,{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000)});
 const b=Buffer.from(await r.arrayBuffer());
 if(!r.ok||(r.headers.get('content-type')||'').split(';')[0].trim().toLowerCase()!==mime||b.length!==bytes.length||hash(b)!==digest) throw new Error('Anonymous readback failed for dl_id '+id);
}
async function upload(s,b){
 const form=new URLSearchParams({file:JSON.stringify({name:s.name,base64:'data:'+s.mime+';base64,'+b.toString('base64'),private:-1}),...auth});
 const r=await fetch(base+'/api/v1/dropbox/file/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',Accept:'application/json'},body:form,redirect:'error',signal:AbortSignal.timeout(60000)});
 const raw=await r.text(); let j; try{j=JSON.parse(raw)}catch{throw new Error('Dropbox upload non-JSON HTTP '+r.status)}
 const id=Number(j?.data?.dl_id);
 if(!r.ok||j?.status!=='success'||String(j?.code)!=='200'||!Number.isInteger(id)||id<=0) throw new Error('Dropbox upload rejected: '+JSON.stringify({http:r.status,code:j?.code,message:j?.message}));
 return id;
}
await fs.mkdir('article-7-backup',{recursive:true});
const audit={article_id:7,assets:[],updated:false};
try{
 const [[ident]]=await db.query('SELECT DATABASE() AS db, @@read_only AS ro');
 if(ident.db!=='aristotel_tutor'||Number(ident.ro)!==0) throw new Error('DB identity/read-write guard failed');
 const [rows]=await db.execute('SELECT name,value FROM blog_post WHERE id_blog_post=?',[7]);
 if(rows.length!==1) throw new Error('Article 7 row missing or duplicated');
 const original=String(rows[0].value); audit.title=rows[0].name; audit.original_sha256=hash(Buffer.from(original));
 await fs.writeFile('article-7-backup/article-7-before.json',JSON.stringify({id_blog_post:7,name:rows[0].name,value:original},null,2));
 const article=JSON.parse(original);
 if(article.format_version!=='1.3'||!Array.isArray(article.assets)) throw new Error('Article 7 format/assets mismatch');
 const refs=[...new Set([article.cover?.file,...article.assets.map(a=>a.file),...(article.blocks||[]).flatMap(b=>[b.file,...(b.images||[]).map(i=>i.file)]),...(article.technical_knowledge?.operations||[]).flatMap(o=>(o.media_refs||[]).map(m=>m.file))].filter(Boolean))];
 for(const p of refs) if(!src[p]) throw new Error('Unexpected media path: '+p);
 if(refs.length!==2) throw new Error('Expected exactly two unique media paths: '+JSON.stringify(refs));
 const map=new Map();
 for(const p of refs){
  const s=src[p]; const asset=article.assets.find(a=>a.file===p);
  if(!asset||Number(asset.size_bytes)!==s.size) throw new Error('Asset registry/size mismatch: '+p);
  const response=await fetch(s.url,{redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!response.ok) throw new Error('Source fetch failed '+p+' HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length!==s.size||!bytes.toString('utf8').trimStart().startsWith('<svg')) throw new Error('Source integrity failed '+p);
  const digest=hash(bytes); let id;
  if(asset.dl_id){id=Number(asset.dl_id);await verify(id,bytes,s.mime,digest)}
  else{id=await upload(s,bytes);await verify(id,bytes,s.mime,digest)}
  asset.dl_id=id; map.set(p,{id,bytes,digest,s});
 }
 const next=JSON.stringify(article);
 if(next!==original){
  await db.beginTransaction();
  try{
   const [res]=await db.execute('UPDATE blog_post SET value=? WHERE id_blog_post=? AND value=?',[next,7,original]);
   if(res.affectedRows!==1) throw new Error('Optimistic update failed; article 7 changed');
   await db.commit(); audit.updated=true;
  }catch(e){await db.rollback().catch(()=>{});throw e}
 }
 const [back]=await db.execute('SELECT name,value FROM blog_post WHERE id_blog_post=?',[7]);
 if(back.length!==1||back[0].name!==rows[0].name) throw new Error('Article readback failed');
 const saved=JSON.parse(String(back[0].value));
 for(const [p,v] of map){
  const a=saved.assets.find(x=>x.file===p);
  if(!a||Number(a.dl_id)!==v.id) throw new Error('Saved mapping mismatch '+p);
  await verify(v.id,v.bytes,v.s.mime,v.digest);
  audit.assets.push({file:p,dl_id:v.id,mime:v.s.mime,bytes:v.bytes.length,sha256:v.digest,anonymous_readback:'passed'});
 }
 audit.database=ident.db;audit.saved_sha256=hash(Buffer.from(String(back[0].value)));
 await fs.writeFile('article-7-backup/article-7-migration-audit.json',JSON.stringify(audit,null,2));
 console.log('ARTICLE_7_DROPBOX_MIGRATION '+JSON.stringify(audit));
}catch(e){
 await fs.writeFile('article-7-backup/article-7-migration-failure.json',JSON.stringify({article_id:7,title:audit.title,error:String(e.message||e),assets:audit.assets},null,2)).catch(()=>{});
 throw e;
}finally{await db.end()}
