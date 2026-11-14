const fs = require('node:fs');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const assert = require('node:assert/strict');
const root = require('node:path').resolve(__dirname, '..') + '/';
const req = createRequire(root + 'index.js');
req('dotenv').config({path:root+'.env',quiet:true});
const { Pool } = req('pg');
const schema = 'codex_test_' + Date.now();
assert.match(schema,/^codex_test_\d+$/);
const admin = new Pool({connectionTimeoutMillis:3000});
const db = new Pool({options:`-c search_path=${schema}`,connectionTimeoutMillis:3000});
let server;
let count = 0;
async function main() {
  await admin.query(`CREATE SCHEMA ${schema}`);
  await db.query(`
    CREATE TABLE usuarios (id serial PRIMARY KEY, email text UNIQUE, password text, rol text);
    CREATE TABLE clientes (id serial PRIMARY KEY, nombre text NOT NULL, telefono text, email text UNIQUE);
    CREATE TABLE tickets (id serial PRIMARY KEY, cliente text NOT NULL, asunto text NOT NULL, estado text DEFAULT 'Pendiente', fecha date DEFAULT CURRENT_DATE, descripcion text);
    CREATE TABLE reportes_tecnicos (id serial PRIMARY KEY, ticket_id integer NOT NULL, contador_paginas integer, nivel_toner text, repuestos_cambiados text, observaciones text, fecha_reporte timestamp DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE historico_tickets (id serial PRIMARY KEY, ticket_id integer NOT NULL, estado_anterior text, estado_nuevo text, fecha_cambio timestamp DEFAULT CURRENT_TIMESTAMP);
  `);
  let resolveReady;
  const ready = new Promise(resolve => resolveReady=resolve);
  const express = req('express');
  const expressWrapped = Object.assign(function() {
    const app = express();
    const listen = app.listen.bind(app);
    app.listen = (_port,callback) => {
      server = listen(0,'127.0.0.1',()=>{callback();resolveReady();});
      return server;
    };
    return app;
  },express);
  const sandboxRequire = name => name === 'pg' ? {Pool:class {constructor(){return db;}}} : name === 'express' ? expressWrapped : name === 'dotenv' ? {config(){}} : req(name);
  vm.runInNewContext(fs.readFileSync(root+'index.js','utf8'),{
    require:sandboxRequire, console, Buffer,
    process:{env:{...process.env,JWT_SECRET:'isolated-test-secret',BOOTSTRAP_ADMIN_SECRET:'test-bootstrap'},exit(code){throw new Error('Startup failed '+code);}}
  },{filename:root+'index.js'});
  await Promise.race([ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('Startup timeout')),6000))]);
  const base = `http://127.0.0.1:${server.address().port}`;
  let token;
  async function call(method,path,body,status=200,auth=true,extra={}) {
    const response = await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(auth&&token?{Authorization:`Bearer ${token}`} : {}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
    const data = await response.json();
    assert.equal(response.status,status,`${method} ${path}: ${JSON.stringify(data)}`);
    count++;
    return data;
  }
  await call('GET','/api/tickets',undefined,401,false);
  await call('POST','/api/registrar-admin',{email:'test@example.invalid',password:'test-password'},403,false);
  await call('POST','/api/registrar-admin',{email:'test@example.invalid',password:'test-password'},200,false,{'x-bootstrap-secret':'test-bootstrap'});
  await call('POST','/api/login',{email:'test@example.invalid',password:'wrong'},401,false);
  token=(await call('POST','/api/login',{email:'test@example.invalid',password:'test-password'})).token;
  await call('POST','/api/clientes',{nombre:'   '},400);
  await call('POST','/api/clientes',{nombre:'Cliente de prueba',telefono:'111',email:'one@example.invalid'});
  await call('POST','/api/clientes',{nombre:'Cliente de prueba',telefono:'222',email:'two@example.invalid'});
  const clients=await call('GET','/api/clientes');
  await call('POST','/api/tickets',{cliente:'Cliente de prueba',equipo:'HP',falla:'No imprime'},400);
  await call('POST','/api/tickets',{clienteId:clients[1].id,equipo:'  ',falla:'No imprime'},400);
  await call('POST','/api/tickets',{clienteId:99999,equipo:'HP',falla:'No imprime'},404);
  await call('POST','/api/tickets',{clienteId:clients[1].id,equipo:'HP',falla:'No imprime'});
  const [ticket]=await call('GET','/api/tickets');
  assert.equal(ticket.cliente_id,clients[1].id);
  await call('PUT',`/api/tickets/${ticket.id}`,{estado:'En Revisión'});
  await call('PUT',`/api/tickets/${ticket.id}`,{estado:'Inventado'},400);
  await call('POST','/api/reportes',{ticket_id:ticket.id,contador_paginas:-1,nivel_toner:'Bajo',observaciones:'Prueba'},400);
  await call('POST','/api/reportes',{ticket_id:ticket.id,contador_paginas:0,nivel_toner:'Bajo',observaciones:'Prueba'});
  const report=await call('GET',`/api/reportes/${ticket.id}`);
  assert.equal(report.contador_paginas,0);
  assert.equal(report.nivel_toner,'Bajo');
  await db.query("UPDATE reportes_tecnicos SET fecha_reporte = CURRENT_DATE - INTERVAL '4 months'");
  let alerts=await call('GET','/api/alertas-garantia');
  assert.equal(alerts.length,1);
  assert.equal(alerts[0].telefono,'222');
  await call('POST',`/api/alertas-garantia/${ticket.id}/contactar`,{});
  assert.equal((await call('GET','/api/alertas-garantia')).length,0);
  await call('POST','/api/reportes',{ticket_id:ticket.id,contador_paginas:123,nivel_toner:'0%',observaciones:'Segunda atención'});
  assert.equal((await call('GET',`/api/reportes/${ticket.id}`)).contador_paginas,123);
  assert.equal((await db.query('SELECT alerta_contactada FROM tickets')).rows[0].alerta_contactada,false);
  const expired=req('jsonwebtoken').sign({id:1},'isolated-test-secret',{expiresIn:-1});
  await call('GET','/api/tickets',undefined,401,false,{Authorization:`Bearer ${expired}`});
  await call('DELETE',`/api/tickets/${ticket.id}`);
  assert.equal((await db.query('SELECT * FROM reportes_tecnicos')).rowCount,0);
  assert.equal((await db.query('SELECT * FROM historico_tickets')).rowCount,0);
  await call('DELETE',`/api/tickets/${ticket.id}`,undefined,404);
  console.log(`PASS: ${count} comprobaciones HTTP y verificaciones de datos en esquema aislado.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  if(server) await new Promise(resolve=>server.close(resolve));
  await db.end();
  await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await admin.end();
  console.log('Esquema de prueba eliminado. Registros originales sin cambios.');
});
