import test from "node:test";
import assert from "node:assert/strict";
import {publicArtist} from "./public-artists.js";
import {validateProfile,publicProfile} from "./profile.js";
const entry={_id:"abc123",publicPageEnabled:true,displayName:"Artist",profession:"Producer",email:"secret@example.com",role:"admin",passwordHash:"secret",proofCode:"PRIVATE",verifiedAt:null,portfolio:[{title:"Demo",url:"https://soundcloud.com/test/demo",description:"Demo",role:"Producer"}],preferredRoles:["Singer"],genres:["Trap"]};
test("artist profiles require explicit public consent",()=>{
 assert.equal(publicArtist({...entry,publicPageEnabled:false}),null);
 assert.equal(publicArtist({...entry,publicPageEnabled:undefined}),null);
 assert.equal(publicArtist(entry).displayName,"Artist");
});
test("public artist data excludes credentials and private preferences",()=>{
 const publicData=publicArtist(entry);
 for(const field of ["email","role","passwordHash","proofCode","preferredRoles","verifiedAt","publicPageEnabled"])assert.equal(publicData[field],undefined);
 assert.equal(publicData.portfolio[0].url,"https://soundcloud.com/test/demo");
});
test("only boolean visibility is accepted and self profile reflects it",()=>{
 assert.equal(validateProfile({publicPageEnabled:true}).update.publicPageEnabled,true);
 assert.equal(validateProfile({publicPageEnabled:"true"}).error,"Public profile visibility must be true or false.");
 assert.equal(publicProfile(entry).publicPageEnabled,true);
});
