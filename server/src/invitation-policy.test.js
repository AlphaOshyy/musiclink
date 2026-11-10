import test from "node:test";
import assert from "node:assert/strict";
import {canRespond,canInvite,canRemoveShortlist} from "./invitation-policy.js";
const project={owner:"owner",status:"open",shortlist:["creator"]};
test("Only owner invites a shortlisted creator to an open project",()=>{
 assert.equal(canInvite(project,"owner","creator").ok,true);
 assert.equal(canInvite(project,"stranger","creator").status,403);
 assert.equal(canInvite(project,"owner","unlisted").status,403);
 assert.equal(canInvite({...project,status:"closed"},"owner","creator").status,409);
 assert.equal(canInvite({...project,shortlist:["owner"]},"owner","owner").status,400);
});
test("Invitation is accepted or declined exactly once, by receiver",()=>{
 const invite={receiver:"creator",status:"pending"};
 assert.equal(canRespond(invite,"creator","accepted").ok,true);
 assert.equal(canRespond(invite,"other","accepted").status,403);
 assert.equal(canRespond(invite,"creator","pending").status,400);
 assert.equal(canRespond({...invite,status:"accepted"},"creator","declined").status,409);
});
test("Shortlist ownership and membership checks",()=>{
 assert.equal(canRemoveShortlist(project,"owner","creator").ok,true);
 assert.equal(canRemoveShortlist(project,"other","creator").status,403);
 assert.equal(canRemoveShortlist(project,"owner","other").status,404);
});
