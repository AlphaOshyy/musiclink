import test from "node:test";
import assert from "node:assert/strict";
import { rank } from "./matcher.js";
test("perfect MCCA and reciprocal score",()=>{
 const p={genres:["Trap"],requiredSkills:["Producing"],requiredRoles:["Producer"],creativeTags:["Dark"]};
 const u={id:"a",profession:"Producer",genres:["Trap"],skills:["Producing"],creativeTags:["Dark"],available:true,portfolio:[{genres:["Trap"],tags:["Dark"]}]};
 const value=rank(p,[u]).ranked[0];
 assert.equal(value.forward,100);assert.equal(value.reverse,100);assert.equal(value.score,100);
});
test("unavailable reduces score",()=>{
 const u={id:"a",profession:"Producer",genres:["Trap"],skills:["Producing"],creativeTags:["Dark"],available:false,portfolio:[{genres:["Trap"],tags:["Dark"]}]};
 assert.equal(rank({genres:["Trap"],requiredSkills:["Producing"],requiredRoles:["Producer"],creativeTags:["Dark"]},[u]).ranked[0].forward,90);
});
test("reciprocal preferences affect ranking",()=>{
 const p={genres:["Trap"],requiredRoles:["Producer"]};
 const base={profession:"Producer",genres:["Trap"],available:true};
 const users=[{...base,id:"b",preferredGenres:["Jazz"]},{...base,id:"a",preferredGenres:["Trap"]}];
 assert.equal(rank(p,users).ranked[0].id,"a");
});
