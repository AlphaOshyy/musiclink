// Live API smoke test for a temporary account, runs in CI without printing credentials.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
const api = process.env.MUSICLINK_API_URL || "https://musiclink-api.vercel.app/api";
if(!/^https:\/\//.test(api)) throw Error("A public HTTPS API is required.");
const nonce=randomBytes(10).toString("hex");
const email=`ci-auth-${nonce}@example.invalid`;
const password=randomBytes(32).toString("base64url");
process.stdout.write("Running public authentication smoke test.\n");
async function call(path,{method="GET",body,token}={}){
 const res=await fetch(api+path,{method,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 const data=await res.json().catch(()=>({}));
 return {status:res.status,data,headers:res.headers};
}
const health=await call("/health/db");
assert.equal(health.status,200,"Cloud database must be reachable");
const absent=await call("/me");
assert.equal(absent.status,401,"Anonymous profile access denied");
const weak=await call("/auth/register",{method:"POST",body:{displayName:"CI Test",email,password:"short"}});
assert.equal(weak.status,400,"Weak password should fail");
const reg=await call("/auth/register",{method:"POST",body:{displayName:"CI Auth Check",email,password}});
assert.equal(reg.status,201,"New user registration");
assert.equal(typeof reg.data.token,"string");
assert.equal(reg.data.user.displayName,"CI Auth Check");
assert.ok(!JSON.stringify(reg.data).includes("passwordHash"),"Password hash must never be returned");
const duplicate=await call("/auth/register",{method:"POST",body:{displayName:"CI Auth Check",email,password}});
assert.equal(duplicate.status,409,"Duplicate email rejected");
const rejected=await call("/auth/login",{method:"POST",body:{email,password:"bad-password"}});
assert.equal(rejected.status,401,"Wrong password denied");
const signin=await call("/auth/login",{method:"POST",body:{email:email.toUpperCase(),password}});
assert.equal(signin.status,200,"Login with normalized email");
assert.equal(typeof signin.data.token,"string");
const self=await call("/me",{token:signin.data.token});
assert.equal(self.status,200,"Authenticated profile returns 200");
assert.equal(self.data.id,reg.data.user.id,"Login maps to same account");
const badToken=await call("/me",{token:signin.data.token+"bad"});
assert.equal(badToken.status,401,"Tampered JWT rejected");
const project=await call("/projects",{token:signin.data.token});
assert.equal(project.status,200,"Protected projects accessible to account");
assert.ok(!JSON.stringify(self.data).includes("passwordHash"),"Profile response cannot leak password");
process.stdout.write("PASS: registration, invalid input, duplicate email, login, JWT and protected routes.\n");
// CI test user should be deleted from Atlas by project maintainers after validation.
// Do not log or persist generated credentials or bearer tokens.
