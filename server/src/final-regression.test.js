import test from "node:test";
import assert from "node:assert/strict";
import {rank} from "./matcher.js";
import {audioCompatibility,vocalCompatibility,combineAcoustic,audioAdjustedScore} from "./audio-matching.js";
import {canInvite,canRespond} from "./invitation-policy.js";
import {canReview,publicVerification} from "./verification.js";
const project={owner:"owner",status:"open",shortlist:["c1"],genres:["Trap"],requiredRoles:["Producer"]};
const user={id:"c1",profession:"Producer",genres:["Trap"],skills:[],creativeTags:[],portfolio:[],available:true};
test("final security regression: only project owners shortlist and invite",()=>{
 assert.equal(canInvite(project,"not-owner","c1").status,403);
 assert.equal(canInvite(project,"owner","c1").ok,true);
 assert.equal(canInvite({...project,status:"closed"},"owner","c1").status,409);
 assert.equal(canRespond({receiver:"c1",status:"pending"},"attacker","accepted").status,403);
 assert.equal(canRespond({receiver:"c1",status:"accepted"},"c1","declined").status,409);
});
test("final security regression: no self-verified badges and admin-only approval",()=>{
 assert.deepEqual(publicVerification({displayName:"Artist"}),{verified:false});
 assert.equal(canReview("creator",{decision:"approve",confirmedOwnership:true}).status,403);
 assert.equal(canReview("admin",{decision:"approve",confirmedOwnership:true}).decision,"approve");
});
test("final ranking regression: missing browser measurements do not hurt artists",()=>{
 const plain=rank(project,[user]).ranked[0];
 const audio=rank(project,[user],{reference:null,byCreator:{},vocalReference:null,vocalByCreator:{}}).ranked[0];
 assert.deepEqual(plain,audio);
 assert.equal(plain.score,plain.baseScore);
 assert.equal(audioCompatibility({confidence:0},{}),null);
 assert.equal(vocalCompatibility({confidence:0},{}),null);
 assert.equal(combineAcoustic(null,null),null);
 assert.equal(audioAdjustedScore(plain.score,null),plain.score);
});
