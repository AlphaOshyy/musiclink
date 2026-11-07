import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
const API=process.env.MUSICLINK_API_URL||"https://musiclink-api.vercel.app/api";
if(!API.startsWith("https://"))throw Error("Use HTTPS for live tests");
const suffix=randomBytes(10).toString("hex");
const emailA="ci-profile-"+suffix+"-a@example.invalid";
const emailB="ci-profile-"+suffix+"-b@example.invalid";
const password=randomBytes(26).toString("base64url");
async function call(path,method="GET",body=null,token=null){
 const response=await fetch(API+path,{method,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
 return {code:response.status,data:await response.json().catch(()=>({}))};
}
async function run(){
 const register=async(displayName,email)=>{
  const r=await call("/auth/register","POST",{email,password,displayName});
  assert.equal(r.code,201,"register temporary account");return r.data;
 };
 const a=await register("CI Profile A",emailA);
 const b=await register("CI Profile B",emailB);
 assert.equal((await call("/creators")).code,401,"protected directory");
 const updated=await call("/me","PUT",{displayName:"Artist A",profession:"Producer",bio:"Electronic producer",genres:["Trap","Hip Hop"],skills:["Mixing","Production"],creativeTags:["Ambient"],available:false,avatarUrl:"https://images.example.org/artist.jpg",preferredRoles:["Vocalist"],preferredGenres:["Trap"],preferredTags:["Moody"]},a.token);
 assert.equal(updated.code,200,"update own profile");
 assert.equal(updated.data.available,false,"availability false preserved");
 assert.equal(updated.data.avatarUrl,"https://images.example.org/artist.jpg");
 assert.ok(updated.data.completeness>=70,"completeness calculated");
 assert.equal(updated.data.email,undefined,"email private");
 assert.equal(updated.data.passwordHash,undefined,"password hash private");
 assert.equal((await call("/me","PUT",{available:"false"},a.token)).code,400,"invalid availability");
 const profile=await call("/creators/"+a.user.id,"GET",null,b.token);
 assert.equal(profile.code,200,"other creator public profile");
 assert.equal(profile.data.displayName,"Artist A");
 assert.equal(profile.data.email,undefined);
 const list=await call("/creators?genre=Trap&available=false&q=Artist%20A&limit=10","GET",null,b.token);
 assert.equal(list.code,200,"filtered directory");
 assert.ok(list.data.some(x=>x.id===a.user.id),"search returns matching creator");
 assert.equal((await call("/creators?limit=1000","GET",null,b.token)).code,400,"bounded pagination");
 const portfolio=await call("/me/portfolio","POST",{title:"Demo Track",url:"https://soundcloud.com/demo/track",genres:["Trap"],tags:["Ambient"]},a.token);
 assert.equal(portfolio.code,201,"add portfolio sample");
 assert.equal(portfolio.data.portfolio.length,1);
 const sampleId=portfolio.data.portfolio[0]._id;
 const modified=await call("/me/portfolio/"+sampleId,"PATCH",{title:"Updated Demo",url:"https://soundcloud.com/demo/track2",genres:["Trap"],tags:["Moody"]},a.token);
 assert.equal(modified.code,200,"update portfolio sample");
 assert.equal(modified.data.portfolio[0].title,"Updated Demo");
 assert.equal((await call("/me/portfolio/"+sampleId,"DELETE",null,b.token)).code,404,"cannot remove other creator portfolio");
 assert.equal((await call("/me/portfolio/"+sampleId,"DELETE",null,a.token)).code,200,"remove portfolio");
 assert.equal((await call("/me/portfolio","POST",{title:"Unsafe",url:"javascript:alert(1)"},a.token)).code,400,"reject unsafe URL");
 console.log("PASS: profile validation, search, privacy, portfolio ownership, and sample lifecycle.");
 console.log("Two temporary ci-profile accounts created. Remove them through the database after test.");
}
await run();
