import assert from "node:assert/strict";
import {randomBytes} from "node:crypto";
const base="https://musiclink-api.vercel.app/api";
const nonce=randomBytes(10).toString("hex"),password=randomBytes(28).toString("base64url");
async function req(path,method="GET",body=null,token=""){
 const r=await fetch(base+path,{method,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(40000)});
 return {status:r.status,data:await r.json().catch(()=>({}))};
}
async function create(name){
 const r=await req("/auth/register","POST",{email:"ci-day11-"+nonce+"-"+name+"@example.invalid",password,displayName:"Day11 "+name});
 assert.equal(r.status,201,JSON.stringify(r.data));return r.data;
}
const owner=await create("owner"),other=await create("other");
async function upload(kind,title){
 const wav=Buffer.alloc(96);wav.write("RIFF",0);wav.write("WAVE",8);
 const r=await fetch(base+"/me/audio?kind="+kind+"&title="+encodeURIComponent(title),{method:"POST",headers:{"Content-Type":"audio/wav",Authorization:"Bearer "+owner.token},body:wav,signal:AbortSignal.timeout(40000)});
 assert.equal(r.status,201,await r.text().then(s=>s.slice(0,200)));
 const list=await req("/me/audio","GET",null,owner.token);
 return list.data.find(x=>x.title===title);
}
const vocal=await upload("vocal","Day11 Test Vocal");
const music=await upload("music","Day11 Test Instrumental");
const data={version:"musiclink-vocal-dsp-v1",duration:3.4,lowHz:210,highHz:230,medianHz:220,lowNote:"G#3",highNote:"A#3",voicedFraction:.72,stability:.85,confidence:.81,characteristic:"Mostly steady pitch"};
assert.equal((await req("/me/audio/"+vocal.id+"/vocal-analysis","PUT",data,other.token)).status,404,"cannot edit other creator");
assert.equal((await req("/me/audio/"+music.id+"/vocal-analysis","PUT",data,owner.token)).status,404,"non-vocal cannot be processed");
assert.equal((await req("/me/audio/"+vocal.id+"/vocal-analysis","PUT",{...data,highHz:40},owner.token)).status,400,"invalid range rejected");
const updated=await req("/me/audio/"+vocal.id+"/vocal-analysis","PUT",data,owner.token);
assert.equal(updated.status,200,JSON.stringify(updated.data));
assert.equal(updated.data.vocalAnalysis.medianHz,220);
const guestView=await req("/creators/"+owner.user.id+"/audio","GET",null,other.token);
assert.equal(guestView.status,200);
assert.equal(guestView.data.find(x=>x.id===vocal.id).vocalAnalysis.lowNote,"G#3");
assert.equal(guestView.data.find(x=>x.id===music.id).vocalAnalysis,null);
assert.equal((await req("/me/audio/"+vocal.id,"DELETE",null,owner.token)).status,200);
assert.equal((await req("/me/audio/"+music.id,"DELETE",null,owner.token)).status,200);
console.log("DAY11 LIVE PASS: vocal-only storage, ownership checks, metric validation, creator visibility and deletion.");
