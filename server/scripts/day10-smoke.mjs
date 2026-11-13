import assert from "node:assert/strict";
import {randomBytes} from "node:crypto";
const base="https://musiclink-api.vercel.app/api";
const nonce=randomBytes(10).toString("hex"),password=randomBytes(28).toString("base64url");
async function json(path,method="GET",body=null,token=""){
 const response=await fetch(base+path,{method,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(40000)});
 return {status:response.status,body:await response.json().catch(()=>({}))};
}
async function register(label){
 const response=await json("/auth/register","POST",{email:"ci-day10-"+nonce+"-"+label+"@example.invalid",password,displayName:"Day10 "+label});
 assert.equal(response.status,201,JSON.stringify(response.body));return response.body;
}
const owner=await register("owner"),guest=await register("guest");
const wav=Buffer.alloc(92);wav.write("RIFF",0,"ascii");wav.write("WAVE",8,"ascii");
const upload=await fetch(base+"/me/audio?title=Day10%20Audio%20CI&kind=music",{method:"POST",headers:{Authorization:"Bearer "+owner.token,"Content-Type":"audio/wav"},body:wav,signal:AbortSignal.timeout(40000)});
assert.equal(upload.status,201,await upload.text().then(x=>x.slice(0,300))); // response consumed intentionally; retrieve sample via listing
const ownerList=await json("/me/audio","GET",null,owner.token);
assert.equal(ownerList.status,200);
const sample=ownerList.body.find(x=>x.title==="Day10 Audio CI");
assert.ok(sample,"new clip stored");assert.equal(sample.analysis,null);
const data={version:"musiclink-browser-dsp-v1",duration:11.2,bpm:94,key:"C#",mode:"minor",energy:.41,brightness:.54,rhythmStrength:.36,mood:"Neutral",styleHint:"Percussive / beat-driven",confidence:.41};
assert.equal((await json("/me/audio/"+sample.id+"/analysis","PUT",data,guest.token)).status,404,"guest cannot edit");
assert.equal((await json("/me/audio/"+sample.id+"/analysis","PUT",{...data,bpm:999},owner.token)).status,400,"invalid bpm rejected");
assert.equal((await json("/me/audio/"+sample.id+"/analysis","PUT",{...data,source:"server"},owner.token)).status,400,"untrusted provenance rejected");
const saved=await json("/me/audio/"+sample.id+"/analysis","PUT",data,owner.token);
assert.equal(saved.status,200,JSON.stringify(saved.body));assert.equal(saved.body.analysis.bpm,94);
assert.equal(saved.body.analysis.source,"browser-estimate");
const listed=await json("/me/audio","GET",null,owner.token);
assert.equal(listed.status,200);assert.equal(listed.body.find(x=>x.id===sample.id).analysis.key,"C#");
const publicMeta=await json("/creators/"+owner.user.id+"/audio","GET",null,guest.token);
assert.equal(publicMeta.status,200);assert.equal(publicMeta.body.find(x=>x.id===sample.id).analysis.bpm,94);
assert.equal((await json("/me/audio/"+sample.id,"DELETE",null,owner.token)).status,200);
console.log("DAY 10 LIVE PASS: owner-only analysis, bounded metrics, persisted keys/BPM, creator visibility, delete.");
