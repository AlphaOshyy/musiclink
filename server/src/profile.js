
const tags=["genres","skills","creativeTags","preferredRoles","preferredGenres","preferredTags"];
const isRecord=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export function normalizeTags(v){
 if(!Array.isArray(v)||v.length>40||v.some(x=>typeof x!=="string"||x.length>48))return null;
 return [...new Set(v.map(x=>x.trim()).filter(Boolean))].slice(0,20);
}
export function validateUrl(raw,photo=false){
 if(typeof raw!=="string"||raw.length>500)return null;
 try{
  const u=new URL(raw.trim());
  if(!["https:",...(photo?[]:["http:"])].includes(u.protocol)||u.username||u.password||!u.hostname||u.hostname==="localhost"||u.hostname.endsWith(".local")||/^(127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname))return null;
  return u.href;
 }catch{return null;}
}
export function validateProfile(body){
 if(!isRecord(body))return {error:"Invalid profile."};
 const update={};
 for(const [key,max] of Object.entries({displayName:80,profession:80,bio:1500})){
  if(!own(body,key))continue;
  if(typeof body[key]!=="string"||body[key].length>max)return {error:"Invalid "+key+"."};
  const value=body[key].trim();
  if(key==="displayName"&&value.length<2)return {error:"Display name must have at least two characters."};
  update[key]=value;
 }
 if(own(body,"available")){
  if(typeof body.available!=="boolean")return {error:"Availability must be a boolean."};
  update.available=body.available;
 }
 if(own(body,"avatarUrl")){
  if(body.avatarUrl===""||body.avatarUrl===null)update.avatarUrl="";
  else {const u=validateUrl(body.avatarUrl,true);if(!u)return {error:"Avatar needs a valid HTTPS URL."};update.avatarUrl=u;}
 }
 for(const key of tags)if(own(body,key)){
  const v=normalizeTags(body[key]);if(v===null)return {error:"Invalid "+key+" tags."};update[key]=v;
 }
 if(!Object.keys(update).length)return {error:"No profile changes."};
 return {update};
}
export function validatePortfolio(body){
 if(!isRecord(body)||typeof body.title!=="string"||!body.title.trim()||body.title.length>100)return {error:"Invalid portfolio title."};
 const url=validateUrl(body.url);if(!url)return {error:"Invalid portfolio URL."};
 const genres=normalizeTags(body.genres??[]),tags=normalizeTags(body.tags??[]);
 if(genres===null||tags===null)return {error:"Invalid portfolio tags."};
 const description=body.description??"",role=body.role??"",year=body.releaseYear??null;
 if(typeof description!=="string"||description.length>350||typeof role!=="string"||role.length>80)return {error:"Invalid description or credit."};
 if(year!==null&&year!==""&&(!Number.isInteger(Number(year))||Number(year)<1900||Number(year)>new Date().getFullYear()+1))return {error:"Invalid release year."};
 return {item:{title:body.title.trim(),url,genres,tags,description:description.trim(),role:role.trim(),releaseYear:year===null||year===""?null:Number(year)}};
}
export function profileCompleteness(u){
 const fields=[!!u.displayName?.trim(),!!u.profession?.trim(),!!u.bio?.trim(),!!u.avatarUrl,!!u.genres?.length,!!u.skills?.length,!!u.creativeTags?.length,!!u.portfolio?.length,!!u.preferredRoles?.length,!!u.preferredGenres?.length];
 return fields.filter(Boolean).length*10;
}
export function publicProfile(u){
 return {id:String(u._id),displayName:u.displayName,profession:u.profession,avatarUrl:u.avatarUrl||"",genres:u.genres||[],skills:u.skills||[],creativeTags:u.creativeTags||[],available:u.available===true,bio:u.bio||"",portfolio:u.portfolio||[],preferredRoles:u.preferredRoles||[],preferredGenres:u.preferredGenres||[],preferredTags:u.preferredTags||[],completeness:profileCompleteness(u)};
}
export function creatorSearch(query){
 if(!isRecord(query))return {error:"Invalid search."};
 const filter={};
 const esc=s=>s.replace(/[.*+?^$()|[\]{}\\]/g,"\\$&");
 for(const key of ["q","genre","skill","profession"]){
  if(query[key]===undefined)continue;
  if(typeof query[key]!=="string"||query[key].length>60)return {error:"Invalid "+key+"."};
  const v=query[key].trim();if(!v)continue;
  const re=new RegExp((key==="q"?"":"^")+esc(v)+(key==="q"?"":"$"),"i");
  if(key==="q")filter.$or=["displayName","profession","bio","genres","skills"].map(k=>({[k]:re}));
  else filter[{genre:"genres",skill:"skills",profession:"profession"}[key]]=re;
 }
 if(query.available!==undefined){
  if(!["true","false"].includes(query.available))return {error:"Invalid availability."};
  filter.available=query.available==="true";
 }
 const page=query.page===undefined?1:Number(query.page),limit=query.limit===undefined?50:Number(query.limit);
 if(!Number.isInteger(page)||page<1||page>100||!Number.isInteger(limit)||limit<1||limit>50)return {error:"Invalid pagination."};
 return {filter,page,limit};
}
