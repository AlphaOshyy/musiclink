import { randomBytes } from "node:crypto";
const allowedHost=/^[a-z0-9.-]+$/i;
export function validateArtistUrl(value){
 if(typeof value!=="string"||value.length>500)return null;
 try{
  const url=new URL(value.trim());
  const host=url.hostname.toLowerCase();
  if(url.protocol!=="https:"||url.username||url.password||url.port||!allowedHost.test(host)||host==="localhost"||host.endsWith(".local")||host.endsWith(".internal")||host.endsWith(".test")||host.endsWith(".invalid")||host.endsWith(".onion")||host==="0.0.0.0"||host.includes("..")||!host.includes(".")||/^(?:\d+\.){3}\d+$/.test(host)||/^(?:127|10|192\.168|169\.254|172\.(?:1[6-9]|2\d|3[01]))\./.test(host)||host.startsWith("metadata."))return null;
  url.hash="";return url.toString();
 }catch{return null}
}
export function validateRequest(body){
 if(!body||Array.isArray(body)||typeof body!=="object")return {error:"Invalid verification request."};
 const {artistName,platform,officialUrl,notes}=body;
 if(typeof artistName!=="string"||artistName.trim().length<2||artistName.trim().length>80)return {error:"Artist name must be 2 to 80 characters."};
 if(!["website","youtube","spotify","soundcloud","instagram","other"].includes(platform))return {error:"Choose an official artist platform."};
 const url=validateArtistUrl(officialUrl);
 if(!url)return {error:"Enter a public HTTPS artist or official website URL."};
 const hostname=new URL(url).hostname.toLowerCase();
 if(platform==="youtube"&&!["youtube.com","www.youtube.com","m.youtube.com","music.youtube.com"].includes(hostname))return {error:"Use an official YouTube URL."};
 if(platform==="spotify"&&!["open.spotify.com","spotify.com"].includes(hostname))return {error:"Use a Spotify artist page."};
 if(platform==="soundcloud"&&!["soundcloud.com","www.soundcloud.com"].includes(hostname))return {error:"Use a SoundCloud artist profile."};
 if(platform==="instagram"&&!["instagram.com","www.instagram.com"].includes(hostname))return {error:"Use an Instagram artist account."};
 if(typeof notes!=="string"||notes.length>600)return {error:"Notes must be 600 characters or fewer."};
 return {data:{artistName:artistName.trim(),platform,officialUrl:url,notes:notes.trim()}};
}
export const newProofCode=()=> "ML-"+randomBytes(12).toString("hex").toUpperCase();
export function publicVerification(user){
 return user?.verifiedAt?{verified:true,artistName:user.verifiedArtistName||user.displayName,platform:user.verifiedPlatform||""}:{verified:false};
}
export function canReview(role,body){
 if(role!=="admin")return {error:"Administrator access required.",status:403};
 if(!body||Array.isArray(body)||typeof body!=="object"||!["approve","reject"].includes(body.decision))return {error:"Select approve or reject.",status:400};
 if(body.decision==="approve"&&body.confirmedOwnership!==true)return {error:"Confirm independent ownership verification before approval.",status:400};
 if(body.reason!==undefined&&(typeof body.reason!=="string"||body.reason.length>500))return {error:"Invalid review notes.",status:400};
 if(body.decision==="reject"&&!String(body.reason||"").trim())return {error:"Explain the rejection to the artist.",status:400};
 return {decision:body.decision,reason:String(body.reason||"").trim()};
}
