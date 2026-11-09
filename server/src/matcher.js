// MusicLink MCCA v2. Deterministic, transparent research prototype.
// This is a weighted matching heuristic, not a trained or validated AI model.
export const WEIGHTS=Object.freeze({genre:.20,skills:.25,creative:.25,portfolio:.20,availability:.10});
const round=n=>Math.round(Math.max(0,Math.min(100,n))*100)/100;
const norm=xs=>new Set((Array.isArray(xs)?xs:[]).filter(x=>typeof x==="string").map(x=>x.trim().toLowerCase()).filter(Boolean));
const overlap=(wanted,offered,neutral=50)=>{
 const requirements=norm(wanted);
 if(!requirements.size)return neutral;
 const provided=norm(offered);
 return round(100*[...requirements].filter(x=>provided.has(x)).length/requirements.size);
};
const requirementsCount=p=>["genres","requiredSkills","requiredRoles","creativeTags"].filter(k=>norm(p[k]).size).length;
const roleAliases={
 "producer":["producer","music producer","beat maker","beatmaker"],
 "vocalist":["vocalist","singer","rapper","artist","recording artist"],
 "singer":["singer","vocalist","artist","recording artist"],
 "rapper":["rapper","vocalist","artist","recording artist"],
 "mixing engineer":["mixing engineer","audio engineer","mix engineer"],
 "mastering engineer":["mastering engineer","audio engineer","mastering"],
 "songwriter":["songwriter","lyricist","writer"],
 "lyricist":["lyricist","songwriter","writer"]
};
function roleMatch(roles,profession){
 const wanted=norm(roles);
 if(!wanted.size)return 50;
 const actual=String(profession||"").trim().toLowerCase();
 return [...wanted].some(role=>role===actual||roleAliases[role]?.includes(actual))?100:0;
}
function forward(p,u){
 const port=Array.isArray(u.portfolio)?u.portfolio:[];
 const role=roleMatch(p.requiredRoles,u.profession);
 const skill=overlap(p.requiredSkills,u.skills);
 const hasSkill=norm(p.requiredSkills).size>0,hasRole=norm(p.requiredRoles).size>0;
 const blended=hasSkill&&hasRole?round(.8*skill+.2*role):hasSkill?skill:hasRole?role:50;
 const genre=overlap(p.genres,u.genres),creative=overlap(p.creativeTags,u.creativeTags);
 const portfolioGenres=port.flatMap(x=>x.genres||[]),portfolioTags=port.flatMap(x=>x.tags||[]);
 const relevantPortfolio=port.length?round((overlap(p.genres,portfolioGenres)+overlap(p.creativeTags,portfolioTags))/2):0;
 const factors={genre,skills:blended,creative,portfolio:relevantPortfolio,availability:u.available===true?100:0};
 const value=round(Object.entries(WEIGHTS).reduce((sum,[name,w])=>sum+w*factors[name],0));
 return {value,factors,roleMatch:role};
}
function reverse(p,u){
 const factors={
  role:overlap(u.preferredRoles,p.requiredRoles,100),
  genre:overlap(u.preferredGenres,p.genres,100),
  creative:overlap(u.preferredTags,p.creativeTags,100),
  availability:u.available===true?100:0
 };
 return {value:round(.30*factors.role+.30*factors.genre+.30*factors.creative+.10*factors.availability),factors};
}
function reasons(factors,reciprocal,role){
 const nice={genre:"genre",skills:"skills and role",creative:"creative direction",portfolio:"portfolio evidence",availability:"availability"};
 const strengths=Object.entries(factors).filter(([k,v])=>v>=70&&k!=="availability").sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>nice[k]);
 const gaps=Object.entries(factors).filter(([k,v])=>v<40&&k!=="portfolio").slice(0,2).map(([k])=>nice[k]);
 const parts=[];
 parts.push(strengths.length?"Strong on "+strengths.join(" and ")+".":"Limited direct evidence of fit.");
 if(gaps.length)parts.push("Check "+gaps.join(" and ")+".");
 if(factors.portfolio===0)parts.push("No relevant portfolio evidence.");
 if(factors.availability===0)parts.push("Currently unavailable.");
 if(reciprocal<60)parts.push("Creator preferences may not align.");
 if(role===0)parts.push("Requested role is not an exact match.");
 return parts.join(" ");
}
export function rank(project,candidates){
 const ranked=(Array.isArray(candidates)?candidates:[]).map(u=>{
  const f=forward(project,u),r=reverse(project,u);
  const score=round(Math.sqrt(f.value*r.value));
  const genreOnly=overlap(project.genres,u.genres);
  const profileSimilarity=round((genreOnly+overlap(project.requiredSkills,u.skills))/2);
  const evidence={
   specifiedRequirements:requirementsCount(project),
   totalRequirementDimensions:4,
   hasPortfolio:!!u.portfolio?.length,
   available:u.available===true
  };
  return {
   id:String(u._id||u.id),score,forward:f.value,reverse:r.value,
   factors:f.factors,reverseFactors:r.factors,roleMatch:f.roleMatch,
   explanation:reasons(f.factors,r.value,f.roleMatch),
   evidence,baseline:{genreOnly,profileSimilarity}
  };
 }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 return {method:"MCCA-RCC v2",weights:WEIGHTS,ranked};
}
export function evaluateRanking(ranked){
 if(!ranked.length)return {candidateCount:0,meanScore:0,meanGenreBaseline:0,meanProfileBaseline:0,topMatches:0};
 const avg=k=>round(ranked.reduce((sum,x)=>sum+k(x),0)/ranked.length);
 return {candidateCount:ranked.length,meanScore:avg(x=>x.score),meanGenreBaseline:avg(x=>x.baseline.genreOnly),meanProfileBaseline:avg(x=>x.baseline.profileSimilarity),topMatches:ranked.filter(x=>x.score>=70).length};
}
