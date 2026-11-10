import assert from "node:assert/strict";
import {randomBytes} from "node:crypto";
const base="https://musiclink-api.vercel.app/api";
const nonce=randomBytes(10).toString("hex");
const password=randomBytes(20).toString("base64url");
async function call(path,method="GET",body=null,token=""){
 const res=await fetch(base+path,{method,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(45000)});
 return {code:res.status,data:await res.json().catch(()=>({}))};
}
async function signup(name){
 const r=await call("/auth/register","POST",{email:"ci-day8-"+nonce+"-"+name+"@example.invalid",password,displayName:name+" MusicLink"});
 assert.equal(r.code,201,"signup "+name+" "+JSON.stringify(r.data));
 return r.data;
}
const creator=await signup("creator");
const viewer=await signup("viewer");
const me=await call("/me","GET",null,creator.token);
assert.equal(me.code,200);assert.equal(me.data.role,"creator");assert.equal(me.data.verified,false);
const outsider=await call("/creators","GET",null,viewer.token);
assert.equal(outsider.code,200);
const publicCreator=outsider.data.find(x=>x.id===me.data.id);
assert.ok(publicCreator,"new creator visible in directory");
assert.equal(publicCreator.role,undefined,"role is private");assert.equal(publicCreator.verified,false);
assert.equal((await call("/verification/admin/queue","GET",null,creator.token)).code,403,"creator cannot review");
assert.equal((await call("/verification/admin/000000000000000000000001","PATCH",{decision:"approve",confirmedOwnership:true},creator.token)).code,403);
assert.equal((await call("/verification/request","POST",{artistName:"Creator MusicLink",platform:"website",officialUrl:"http://example.com",notes:""},creator.token)).code,400,"requires HTTPS");
const request=await call("/verification/request","POST",{artistName:"Creator MusicLink",platform:"youtube",officialUrl:"https://www.youtube.com/@exampletestchannel",notes:"Code will appear in channel description"},creator.token);
assert.equal(request.code,201,JSON.stringify(request.data));assert.match(request.data.proofCode,/^ML-[A-F0-9]{24}$/);
const mine=await call("/verification/mine","GET",null,creator.token);
assert.equal(mine.code,200);assert.equal(mine.data.status,"pending");assert.equal(mine.data.proofCode,request.data.proofCode);
const otherMine=await call("/verification/mine","GET",null,viewer.token);
assert.equal(otherMine.code,200);assert.equal(otherMine.data,null,"verification private");
assert.equal((await call("/verification/request","POST",{artistName:"Creator MusicLink",platform:"youtube",officialUrl:"https://www.youtube.com/@exampletestchannel",notes:""},creator.token)).code,409,"no duplicates");
const after=await call("/me","GET",null,creator.token);assert.equal(after.data.verified,false,"submission never automatically verifies");
console.log("DAY8 LIVE PASS: creator registration, admin deny, HTTPS validation, pending code, private request, no duplicates, badge withheld.");
