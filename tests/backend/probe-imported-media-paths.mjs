#!/usr/bin/env node
const origin='https://ibronevik.itest24.com';
const hash='4d3ee1959e206dce930adec0bd39439bde1a248da8157e22';
const files=['cover.svg','terminal_layout.svg'];
const paths=[
'/uploads/blog'+suffix,
'/taxi_dev2/uploads/blog'+suffix,
'/taxi_dev2/c/tutor/uploads/blog'+suffix,
'/taxi_dev2/c/tutor/api/v1/uploads/blog'+suffix,
'/taxi_dev2/public_html/uploads/blog'+suffix,
];
for(const file of files){
 const suffix='/7/'+hash+'/'+file;
 const paths=[
  '/uploads/blog'+suffix,
  '/taxi_dev2/uploads/blog'+suffix,
  '/taxi_dev2/c/tutor/uploads/blog'+suffix,
  '/taxi_dev2/c/tutor/api/v1/uploads/blog'+suffix,
  '/taxi_dev2/public_html/uploads/blog'+suffix,
 ];
 for(const path of paths){
 try{
  const r=await fetch(origin+path,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(15000)});
  const b=await r.arrayBuffer();
  console.log('MEDIA_PATH '+JSON.stringify({file,path,status:r.status,content_type:r.headers.get('content-type'),bytes:b.byteLength,location:r.headers.get('location')}));
 }catch(e){console.log('MEDIA_PATH '+JSON.stringify({path,error:String(e).slice(0,200)}));}
}
