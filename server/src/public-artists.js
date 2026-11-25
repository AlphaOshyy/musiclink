import {publicVerification} from "./verification.js";
/**
 * Public artist serializer: omit private email, role, preferences, verification
 * proof codes, account identifiers other than shareable artist id and audio.
 */
export function publicArtist(user){
 if(!user||user.publicPageEnabled!==true)return null;
 const portfolio=(user.portfolio||[]).map(item=>({
  title:item.title||"",url:item.url||"",description:item.description||"",
  role:item.role||"",releaseYear:item.releaseYear||null,
  genres:(item.genres||[]).slice(0,8),tags:(item.tags||[]).slice(0,8),
  featured:item.featured===true
 })).filter(x=>x.title&&x.url).slice(0,20);
 return {id:String(user._id),displayName:user.displayName,profession:user.profession||"Independent artist",
  avatarUrl:user.avatarUrl||"",bio:user.bio||"",available:user.available===true,
  genres:(user.genres||[]).slice(0,10),skills:(user.skills||[]).slice(0,10),
  creativeTags:(user.creativeTags||[]).slice(0,10),portfolio,...publicVerification(user)};
}
