import test from "node:test";
import assert from "node:assert/strict";
import {validateProject,validateApplication,validateProjectQuery} from "./projects.js";
test("create project with normalized fields and optional target date",()=>{
 const r=validateProject({title:" New track ",description:" Recording ",genres:["Trap","Trap"],requiredRoles:["Producer"],targetDate:"2027-03-15"});
 assert.equal(r.update.title,"New track");assert.deepEqual(r.update.genres,["Trap"]);assert.equal(r.update.targetDate.toISOString().slice(0,10),"2027-03-15");
});
test("reject unsupported fields, malformed date and invalid status",()=>{
 for(const p of [{title:""},{title:"A",owner:"another"},{title:"A",genres:"Trap"},{title:"A",targetDate:"2026-02-30"},{title:"A",description:2}]) assert.ok(validateProject(p).error);
 assert.ok(validateProject({status:"deleted"},{partial:true}).error);
 assert.equal(validateProject({status:"closed"},{partial:true}).update.status,"closed");
 assert.ok(validateProject({}, {partial:true}).error);
});
test("application notes are bounded",()=>{
 assert.equal(validateApplication({note:" Hello "}).note,"Hello");
 assert.ok(validateApplication({note:"x".repeat(601)}).error);
 assert.ok(validateApplication({note:{bad:true}}).error);
});
test("project list filters are explicit",()=>{
 assert.deepEqual(validateProjectQuery({status:"open",mine:"true"}),{status:"open",mine:true});
 assert.ok(validateProjectQuery({mine:"yes"}).error);
 assert.ok(validateProjectQuery({status:"draft"}).error);
});
