import assert from "node:assert/strict";
import {randomBytes} from "node:crypto";
const base="https://musiclink-api.vercel.app/api",nonce=randomBytes(10).toString("hex"),password=randomBytes(28).toString("base64url");
async function json(path,method="GET",body=null,token=""){
 const r=await fetch(base+path,{method,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(35000)});
 return {status:r.status,body:await r.json().catch(()=>({}))};
}
async function user(label){
 const r=await json("/auth/register","POST",{email:"ci-day12-"+nonce+"-"+label+"@example.invalid",displayName:"Day12 "+label,password});
 assert.equal(r.status,201,JSON.stringify(r.body));return r.body;
}
async function clip(token,title,kind,analysis){
 const wav=Buffer.alloc(96);wav.write("RIFF",0);wav.write("WAVE",8);
 const r=await fetch(base+"/me/audio?title="+encodeURIComponent(title)+"&kind="+kind,{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"audio/wav"},body:wav,signal:AbortSignal.timeout(35000)});
 const data=await r.json().catch(()=>({}));assert.equal(r.status,201,JSON.stringify(data));
 const path=kind==="vocal"?"vocal-analysis":"analysis";
 const saved=await json("/me/audio/"+data.id+"/"+path,"PUT",analysis,token);
 assert.equal(saved.status,200,JSON.stringify(saved.body));return data.id;
}
const music={version:"musiclink-browser-dsp-v1",duration:11.2,bpm:120,key:"C",mode:"major",energy:.6,brightness:.4,rhythmStrength:.8,mood:"Energetic",styleHint:"Rhythmic / electronic",confidence:.84};
const vocal={version:"musiclink-vocal-dsp-v1",duration:11.2,lowHz:196,highHz:392,medianHz:261.6,lowNote:"G3",highNote:"G4",voicedFraction:.8,stability:.75,confidence:.9,characteristic:"Moderately varied pitch"};
const owner=await user("owner"),candidate=await user("candidate"),missing=await user("missing");
const project=await json("/projects","POST",{title:"Day12 MCCA Test",description:"Research workflow checks",requiredRoles:["Vocalist"],genres:["Trap"],creativeTags:["Dark"]},owner.token);
assert.equal(project.status,201,JSON.stringify(project.body));
const projectId=project.body._id;
const baseline=await json("/projects/"+projectId+"/recommendations?mode=visible","GET",null,owner.token);
assert.equal(baseline.status,200,JSON.stringify(baseline.body));
assert.equal(baseline.body.audioEnabled,false);
const baseMatch=baseline.body.ranked.find(x=>x.id===candidate.user.id);
assert.ok(baseMatch);assert.equal(baseMatch.score,baseMatch.baseScore);
const clips=[];
clips.push(await clip(owner.token,"D12 Owner Music","music",music));
clips.push(await clip(owner.token,"D12 Owner Vocal","vocal",vocal));
clips.push(await clip(candidate.token,"D12 Candidate Music","music",{...music,energy:.62}));
clips.push(await clip(candidate.token,"D12 Candidate Vocal","vocal",{...vocal,medianHz:263.1}));
const after=await json("/projects/"+projectId+"/recommendations?mode=visible","GET",null,owner.token);
assert.equal(after.status,200,JSON.stringify(after.body));
assert.equal(after.body.audioEnabled,true);
assert.ok(after.body.audioTypes.includes("music")&&after.body.audioTypes.includes("vocal"));
const match=after.body.ranked.find(x=>x.id===candidate.user.id);
assert.ok(match);assert.deepEqual(match.audio.sources,["music","vocal"]);
assert.ok(match.audio.factors.tempo>=99&&match.audio.factors.vocalRange>=99,JSON.stringify(match.audio));
assert.ok(match.score>match.baseScore);
assert.ok(match.score-match.baseScore<=(100-match.baseScore)*.12+.02);
const unmatched=after.body.ranked.find(x=>x.id===missing.user.id);
assert.ok(unmatched);assert.equal(unmatched.audio,null);
assert.equal(unmatched.score,unmatched.baseScore,"No audio does not reduce profile score");
const blind=await json("/projects/"+projectId+"/recommendations?mode=blind","GET",null,owner.token);
assert.equal(blind.status,200);
const anon=blind.body.ranked.find(x=>x.audio&&x.audio.sources.includes("vocal"));
assert.ok(anon);assert.equal(anon.displayName,undefined);assert.equal(anon.id,undefined);
assert.ok(anon.anonymousRef?.startsWith("Candidate "));
assert.ok(anon.matchId&&!/^[a-f0-9]{24}$/.test(anon.matchId));
assert.equal((await json("/projects/"+projectId+"/recommendations?mode=visible","GET",null,candidate.token)).status,403,"Owner-only ranking");
for(const [id,token] of [[clips[0],owner.token],[clips[1],owner.token],[clips[2],candidate.token],[clips[3],candidate.token]]){
 assert.equal((await json("/me/audio/"+id,"DELETE",null,token)).status,200);
}
console.log("DAY12 LIVE PASS: baseline fallback; music and vocal factor blending; 12% cap; blind anonymity; owner-only access.");
