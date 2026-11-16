/**
 * MusicLink final research evaluation on SYNTHETIC, hand-labelled examples.
 * These scores are software reproducibility checks, NOT empirical validation.
 * Run: node scripts/evaluate-final.mjs
 */
import assert from "node:assert/strict";
import {rank} from "../src/matcher.js";
import {audioAdjustedScore,AUDIO_BLEND} from "../src/audio-matching.js";

const tasks=[
 {name:"Trap producer", project:{genres:["Trap"],requiredSkills:["Mixing"],requiredRoles:["Producer"],creativeTags:["Dark"]}},
 {name:"Jazz singer", project:{genres:["Jazz"],requiredSkills:["Songwriting"],requiredRoles:["Singer"],creativeTags:["Acoustic"]}},
 {name:"Electronic engineer",project:{genres:["Electronic"],requiredSkills:["Mixing"],requiredRoles:["Mixing Engineer"],creativeTags:["Experimental"]}}
];
const profiles=[
 ["a","Producer",["Trap"],["Mixing"],["Dark"],true,true,["Trap"]],
 ["b","Producer",["Electronic"],["Mixing"],["Experimental"],true,true,["Electronic"]],
 ["c","Singer",["Jazz"],["Songwriting"],["Acoustic"],true,true,["Jazz"]],
 ["d","Mixing Engineer",["Electronic"],["Mixing"],["Experimental"],true,true,["Electronic"]],
 ["e","Singer",["Trap"],["Songwriting"],["Dark"],true,false,["Trap"]],
 ["f","Producer",["Jazz"],["Mixing"],["Acoustic"],false,true,["Jazz"]],
 ["g","Producer",["Trap"],["Mixing"],["Dark"],true,false,["Trap"]],
 ["h","Rapper",["Hip Hop"],["Writing"],["Experimental"],true,true,["Hip Hop"]]
];
const creators=profiles.map(([id,profession,genres,skills,creativeTags,available,hasPortfolio,preferredGenres])=>({
 id,profession,genres,skills,creativeTags,available,preferredGenres,
 preferredRoles:[],preferredTags:[],
 portfolio:hasPortfolio?[{genres,tags:creativeTags}]:[]
}));
const labels=[
 new Set(["a","g","e"]),
 new Set(["c","f"]),
 new Set(["d","b"])
];
const genreScore=(project,creator)=>{
 const wanted=project.genres||[];
 return wanted.length?100*wanted.filter(g=>creator.genres.includes(g)).length/wanted.length:50;
};
function precisionAtK(order,relevant,k){
 const selected=order.slice(0,k);
 return selected.filter(id=>relevant.has(id)).length/Math.min(k,selected.length);
}
function recallAtK(order,relevant,k){
 return order.slice(0,k).filter(id=>relevant.has(id)).length/relevant.size;
}
const rows=tasks.map((t,index)=>{
 const ranking=rank(t.project,creators);
 const full=ranking.ranked.map(r=>r.id);
 const baseline=[...creators].sort((a,b)=>genreScore(t.project,b)-genreScore(t.project,a)||a.id.localeCompare(b.id)).map(u=>u.id);
 assert.equal(full.length,creators.length);
 assert.equal(new Set(full).size,creators.length);
 const reference=labels[index];
 return {scenario:t.name,candidates:full.length,
  mccaPrecisionAt3:Number(precisionAtK(full,reference,3).toFixed(3)),
  genrePrecisionAt3:Number(precisionAtK(baseline,reference,3).toFixed(3)),
  mccaRecallAt3:Number(recallAtK(full,reference,3).toFixed(3)),
  genreRecallAt3:Number(recallAtK(baseline,reference,3).toFixed(3)),
  top3:full.slice(0,3).join(", ")};
});
for(const scenario of tasks){
 const before=rank(scenario.project,creators);
 const neutral=rank(scenario.project,creators,{reference:null,byCreator:{},vocalReference:null,vocalByCreator:{}});
 assert.deepEqual(neutral.ranked,before.ranked,"No-audio fallback must be identical");
}
for(const base of [0,25,50,75,100]){
 for(const score of [0,30,70,100])for(const confidence of [.2,.5,1]){
  const adjusted=audioAdjustedScore(base,{score,confidence});
  assert.ok(Math.abs(adjusted-base)<=100*AUDIO_BLEND*confidence+.01,"Acoustic influence stays bounded");
 }
}
const avg=(name)=>Number((rows.reduce((total,r)=>total+r[name],0)/rows.length).toFixed(3));
const summary={dataset:"synthetic",cases:tasks.length,creators:creators.length,precisionAt3:{mcca:avg("mccaPrecisionAt3"),genreBaseline:avg("genrePrecisionAt3")},recallAt3:{mcca:avg("mccaRecallAt3"),genreBaseline:avg("genreRecallAt3")}};
console.log("MusicLink final offline evaluation. Synthetic labels only; not measured collaboration outcomes.");
console.table(rows);
console.log(JSON.stringify(summary,null,2));
console.log("PASS: No-audio fallback, deterministic ranking, score bounds.");
