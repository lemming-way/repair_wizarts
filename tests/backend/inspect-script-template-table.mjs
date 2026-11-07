#!/usr/bin/env node
import mysql from 'mysql2/promise';
const required=['MYSQL_HOST','MYSQL_DATABASE','MYSQL_USER','MYSQL_PASSWORD'];
for(const k of required) if(!process.env[k]) throw new Error('Missing '+k);
const db=await mysql.createConnection({
 host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),
 user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE,
 connectTimeout:15000,multipleStatements:false,
 ...(process.env.MYSQL_SSL==='true'?{ssl:{rejectUnauthorized:true}}:{})
});
try{
 const [[identity]]=await db.query('SELECT DATABASE() AS db,@@hostname AS host,@@read_only AS read_only');
 let columns;
 try{[columns]=await db.query('SHOW COLUMNS FROM script_template')}catch(e){throw new Error('SCRIPT_TEMPLATE_TABLE_ERROR '+String(e.message));}
 console.log('DB_IDENTITY '+JSON.stringify(identity));
 console.log('SCRIPT_TEMPLATE_COLUMNS '+JSON.stringify(columns.map(x=>({field:x.Field,type:x.Type,key:x.Key,extra:x.Extra}))));
 const [rows]=await db.execute("SELECT var,LENGTH(file) AS length,SHA2(file,256) AS sha256 FROM script_template WHERE var IN ('repair_api','repair_api_test_page') ORDER BY var");
 console.log('SCRIPT_TEMPLATE_ROWS '+JSON.stringify(rows));
}finally{await db.end();}
