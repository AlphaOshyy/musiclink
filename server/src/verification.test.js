import test from "node:test";
import assert from "node:assert/strict";
import {validateArtistUrl,validateRequest,canReview,newProofCode,publicVerification} from "./verification.js";
test("official URL validation rejects private and non-HTTPS URLs",()=>{
 for(const bad of ["http://example.com","https://localhost","https://127.0.0.1","https://192.168.1.5","https://10.0.0.5","https://example.local","https://user:pass@example.com","https://example.com:8080"])assert.equal(validateArtistUrl(bad),null,bad);
 assert.equal(validateArtistUrl("https://example.com/artist"),"https://example.com/artist");
});
test("verification request validates artist identity fields",()=>{
 const body={artistName:"Artist Two",platform:"youtube",officialUrl:"https://www.youtube.com/@artisttwo",notes:"Profile ownership code in bio"};
 assert.equal(validateRequest(body).data.platform,"youtube");
 assert.ok(validateRequest({...body,officialUrl:"https://example.com"}).error);
 assert.ok(validateRequest({...body,artistName:"x"}).error);
 assert.ok(validateRequest({...body,notes:"x".repeat(601)}).error);
});
test("only independent admin review with ownership confirmation grants approval",()=>{
 assert.equal(canReview("creator",{decision:"approve",confirmedOwnership:true}).status,403);
 assert.equal(canReview("admin",{decision:"approve"}).status,400);
 assert.equal(canReview("admin",{decision:"approve",confirmedOwnership:true}).decision,"approve");
 assert.equal(canReview("admin",{decision:"reject"}).status,400);
 assert.equal(canReview("admin",{decision:"reject",reason:"Code missing"}).decision,"reject");
});
test("badge only appears for approved verifiedAt accounts",()=>{
 assert.deepEqual(publicVerification({verifiedAt:null,displayName:"Artist"}),{verified:false});
 assert.equal(publicVerification({verifiedAt:new Date(),verifiedArtistName:"Artist"}).verified,true);
 assert.match(newProofCode(),/^ML-[A-F0-9]{24}$/);
});
