import {normalizeTags} from "./profile.js";
const textFields={title:120,description:2000};
const tagFields=["requiredRoles","requiredSkills","genres","creativeTags"];
const isObject=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
export function validateProject(input,{partial=false}={}){
 if(!isObject(input))return {error:"Invalid project data."};
 const allowed=[...Object.keys(textFields),...tagFields,"targetDate",...(partial?["status"]:[])];
 if(Object.keys(input).some(k=>!allowed.includes(k)))return {error:"Unsupported project field."};
 const update={};
 for(const [key,max] of Object.entries(textFields))if(input[key]!==undefined){
  if(typeof input[key]!=="string"||input[key].length>max)return {error:"Invalid "+key+"."};
  update[key]=input[key].trim();
 }
 if(!partial&&!update.title||update.title!==undefined&&!update.title)return {error:"Project title is required."};
 for(const field of tagFields)if(input[field]!==undefined){
  const value=normalizeTags(input[field]);
  if(value===null)return {error:"Invalid "+field+" tags."};
  update[field]=value;
 }
 if(input.targetDate!==undefined){
  if(input.targetDate===null||input.targetDate==="")update.targetDate=null;
  else{
   if(typeof input.targetDate!=="string"||!/^(\d{4})-(\d{2})-(\d{2})$/.test(input.targetDate))return {error:"Enter a valid target date."};
   const date=new Date(input.targetDate+"T00:00:00.000Z");
   if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==input.targetDate)return {error:"Invalid target date."};
   update.targetDate=date;
  }
 }
 if(partial&&input.status!==undefined){
  if(!["open","closed"].includes(input.status))return {error:"Status must be open or closed."};
  update.status=input.status;
 }
 if(partial&&!Object.keys(update).length)return {error:"No project changes supplied."};
 return {update};
}
export function validateApplication(input){
 if(!isObject(input)||Object.keys(input).some(x=>x!=="note"))return {error:"Invalid application."};
 if(input.note!==undefined&&(typeof input.note!=="string"||input.note.length>600))return {error:"Application note must be 600 characters or less."};
 return {note:(input.note??"").trim()};
}
export function validateProjectQuery(q){
 if(!isObject(q))return {error:"Invalid filters."};
 if(Object.keys(q).some(x=>!["status","mine"].includes(x)))return {error:"Invalid project filters."};
 if(q.status!==undefined&&!["open","closed","all"].includes(q.status))return {error:"Invalid status filter."};
 if(q.mine!==undefined&&!["true","false"].includes(q.mine))return {error:"Invalid ownership filter."};
 return {status:q.status||"all",mine:q.mine==="true"};
}
