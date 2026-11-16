import test from "node:test";
import assert from "node:assert/strict";
const api="https://musiclink-api.vercel.app/api";
const site="https://musiclink-web.vercel.app/";
async function check(url){
 const response=await fetch(url,{method:"GET",redirect:"manual",signal:AbortSignal.timeout(20000),headers:{"Accept":"application/json"}});
 return {status:response.status,body:await response.text(),headers:response.headers};
}
test("Day 14 production frontend and API health endpoints",async()=>{
 const [web,health,db]=await Promise.all([check(site),check(api+"/health"),check(api+"/health/db")]);
 assert.equal(web.status,200);
 assert.equal(health.status,200);
 assert.deepEqual(JSON.parse(health.body),{ok:true,service:"musiclink-api"});
 assert.equal(db.status,200);
 assert.deepEqual(JSON.parse(db.body),{ok:true,database:"reachable"});
 assert.ok(health.headers.has("strict-transport-security"));
});
test("Day 14 private endpoints refuse anonymous GET requests",async()=>{
 for(const path of ["/me","/me/audio","/verification/mine","/verification/admin/queue","/me/sent-invitations"]){
  const response=await check(api+path);
  assert.equal(response.status,401,path+" expected 401, got "+response.status);
 }
});
