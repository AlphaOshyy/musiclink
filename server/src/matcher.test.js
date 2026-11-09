import test from "node:test";
import assert from "node:assert/strict";
import {rank,evaluateRanking,WEIGHTS} from "./matcher.js";
const p={genres:["Trap"],requiredSkills:["Producing"],requiredRoles:["Producer"],creativeTags:["Dark"]};
const creator={id:"a",profession:"Producer",genres:["Trap"],skills:["Producing"],creativeTags:["Dark"],available:true,portfolio:[{genres:["Trap"],tags:["Dark"]}]};
test("all five factors score 100 with complete evidence",()=>{
 const r=rank(p,[creator]).ranked[0];
 assert.equal(r.score,100);assert.equal(r.forward,100);assert.equal(r.reverse,100);
 assert.deepEqual(Object.keys(r.factors),Object.keys(WEIGHTS));
 assert.equal(r.evidence.specifiedRequirements,4);
});
test("availability lowers both forward and reciprocal compatibility",()=>{
 const r=rank(p,[{...creator,available:false}]).ranked[0];
 assert.equal(r.forward,90);assert.ok(r.score<90);
 assert.match(r.explanation,/unavailable/);
});
test("creator preferences change ranking",()=>{
 const a={...creator,id:"a",preferredGenres:["Jazz"]};
 const b={...creator,id:"b",preferredGenres:["Trap"]};
 assert.equal(rank(p,[a,b]).ranked[0].id,"b");
});
test("missing skills do not reward a role label as if skills were verified",()=>{
 const a=rank({requiredSkills:["Mixing"]},[{...creator,skills:[],portfolio:[]}]).ranked[0];
 assert.equal(a.factors.skills,0);
 const b=rank({requiredRoles:["Singer"]},[{...creator,profession:"Singer"}]).ranked[0];
 assert.equal(b.factors.skills,100);
});
test("roles accept music industry synonyms without treating unrelated roles as matches",()=>{
 assert.equal(rank({requiredRoles:["Vocalist"]},[{...creator,profession:"Singer"}]).ranked[0].roleMatch,100);
 assert.equal(rank({requiredRoles:["Mastering Engineer"]},[{...creator,profession:"Rapper"}]).ranked[0].roleMatch,0);
});
test("portfolio, creative direction and genre evidence are independent",()=>{
 const r=rank(p,[{...creator,id:"z",portfolio:[],creativeTags:[]}]).ranked[0];
 assert.equal(r.factors.portfolio,0);
 assert.equal(r.factors.creative,0);
 assert.ok(r.score<100);
});
test("rank output is reproducible and baselines are included",()=>{
 const r1=rank(p,[{...creator,id:"b"},{...creator,id:"a"}]);
 const r2=rank(p,[{...creator,id:"a"},{...creator,id:"b"}]);
 assert.deepEqual(r1,r2);
 assert.equal(evaluateRanking(r1.ranked).candidateCount,2);
 assert.equal(evaluateRanking([]).meanScore,0);
});
