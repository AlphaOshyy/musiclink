
import test from "node:test";
import assert from "node:assert/strict";
import {validateProfile,validatePortfolio,creatorSearch,publicProfile,profileCompleteness} from "./profile.js";
test("validate creator profile and reject invalid types",()=>{
 const p=validateProfile({displayName:" Nova ",available:false,genres:["Trap","Trap"," Hip Hop "],skills:["Mixing"]});
 assert.equal(p.update.displayName,"Nova");assert.equal(p.update.available,false);
 assert.deepEqual(p.update.genres,["Trap","Hip Hop"]);
 for(const bad of [{available:"false"},{displayName:"x"},{bio:"x".repeat(1501)},{genres:"Trap"},{role:"admin"}])assert.ok(validateProfile(bad).error);
});
test("validate avatar and portfolio links",()=>{
 assert.ok(validateProfile({avatarUrl:"https://example.org/a.jpg"}).update.avatarUrl);
 assert.ok(validateProfile({avatarUrl:"javascript:alert(1)"}).error);
 assert.ok(validateProfile({avatarUrl:"http://example.org/a.jpg"}).error);
 assert.ok(validatePortfolio({title:"Demo",url:"https://soundcloud.com/a/b"}).item);
 assert.ok(validatePortfolio({title:"Demo",url:"http://localhost/private"}).error);
 assert.ok(validatePortfolio({title:"Demo",url:"javascript:alert(1)"}).error);
});
test("public serializer removes private fields and scores completeness",()=>{
 const p=publicProfile({_id:"id",displayName:"Nova",email:"private@example.org",passwordHash:"secret",role:"admin",profession:"Producer",available:true});
 assert.equal(p.email,undefined);assert.equal(p.passwordHash,undefined);assert.equal(p.role,undefined);
 assert.equal(profileCompleteness({displayName:"Nova"}),10);
});
test("search parameters have bounded pagination and escaped regex",()=>{
 const p=creatorSearch({q:"A.*",available:"true",page:"2",limit:"20"});
 assert.equal(p.page,2);assert.equal(p.limit,20);assert.equal(p.filter.available,true);
 assert.equal(p.filter.$or[0].displayName.test("Axx"),false);
 assert.equal(p.filter.$or[0].displayName.test("A.*"),true);
 assert.ok(creatorSearch({limit:"1000"}).error);
 assert.ok(creatorSearch({available:"yes"}).error);
});
