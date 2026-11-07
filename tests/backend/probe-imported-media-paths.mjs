#!/usr/bin/env node
const origin='https://ibronevik.itest24.com';
const suffix='/7/8bb71e7152315e669fe50569aee5b96914b9da92bbd74e00/cover.svg';
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
  console.log('MEDIA_PATH '+JSON.stringify({path,status:r.status,content_type:r.headers.get('content-type'),bytes:b.byteLength,location:r.headers.get('location')}));
 }catch(e){console.log('MEDIA_PATH '+JSON.stringify({path,error:String(e).slice(0,200)}));}
}
