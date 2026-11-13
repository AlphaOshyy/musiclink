import assert from "node:assert/strict";
import {randomBytes} from "node:crypto";
const base="https://musiclink-api.vercel.app/api";
const nonce=randomBytes(10).toString("hex"),password=randomBytes(28).toString("base64url");
async function req(path,method="GET",body=null,token="",type="application/json"){
 const response=await fetch(base+path,{method,headers:{"Content-Type":type,...(token?{Authorization:"Bearer "+token}:{})},body:body===null?undefined:type==="application/json"?JSON.stringify(body):body,signal:AbortSignal.timeout(40000)});
 if(type==="binary-return")return response;
 return {status:response.status,data:await response.json().catch(()=>({}))};
}
async function register(label){
 const r=await req("/auth/register","POST",{email:"ci-day9-"+nonce+"-"+label+"@example.invalid",password,displayName:"Day9 "+label});assert.equal(r.status,201,JSON.stringify(r.data));return r.data;
}
const owner=await register("owner"),other=await register("other");
const userId=owner.user.id;
const sample=Buffer.alloc(128,0);sample.write("ID3",0,"ascii");
assert.equal((await req("/me/audio","GET",null,owner.token)).status,200);
assert.equal((await req("/me/audio","POST",sample,owner.token,"audio/wav")).status,400,"File type mismatch blocked");
const title="Day9 Audio CI";
const u=await req("/me/audio?title="+encodeURIComponent(title)+"&kind=vocal","POST",sample,owner.token,"audio/mpeg");
assert.equal(u.status,201,JSON.stringify(u.data));assert.equal(u.data.title,title);assert.equal(u.data.kind,"vocal");
const sampleId=u.data.id;
const own=await req("/me/audio","GET",null,owner.token);assert.equal(own.status,200);assert.ok(own.data.some(x=>x.id===sampleId));assert.ok(!("audio" in own.data[0]),"metadata excludes raw bytes");
const creator=await req("/creators/"+userId+"/audio","GET",null,other.token);assert.equal(creator.status,200);assert.ok(creator.data.some(x=>x.id===sampleId));
const unauth=await fetch(base+"/audio/"+sampleId,{signal:AbortSignal.timeout(30000)});assert.equal(unauth.status,401,"audio not publicly exposed");
const clip=await fetch(base+"/audio/"+sampleId,{headers:{Authorization:"Bearer "+other.token},signal:AbortSignal.timeout(30000)});
assert.equal(clip.status,200,"authorized creator may play sample");assert.equal(clip.headers.get("content-type"),"audio/mpeg");
assert.deepEqual(Buffer.from(await clip.arrayBuffer()),sample);
assert.equal((await req("/me/audio/"+sampleId,"DELETE",null,other.token)).status,404,"nonowner cannot delete");
assert.equal((await req("/me/audio/"+sampleId,"DELETE",null,owner.token)).status,200,"owner deletes file");
const missing=await fetch(base+"/audio/"+sampleId,{headers:{Authorization:"Bearer "+owner.token},signal:AbortSignal.timeout(30000)});assert.equal(missing.status,404,"deleted clip unavailable");
console.log("DAY9 LIVE PASS: upload header checks, storage metadata, protected authenticated playback, audio byte equality, non-owner deletion blocked and owner deletion.");
