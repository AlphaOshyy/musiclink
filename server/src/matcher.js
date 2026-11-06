// JavaScript implementation of the proposal's MCCA and RCC calculations.
// The Python model in /recommender remains for independent research testing.
export const WEIGHTS = Object.freeze({genre:0.20,skills:0.25,creative:0.25,portfolio:0.20,availability:0.10});
const norm = xs => new Set((Array.isArray(xs)?xs:[]).map(x=>String(x).trim().toLowerCase()).filter(Boolean));
function coverage(required,provided,neutral=50){
  const wants=norm(required);if(!wants.size)return neutral;
  const has=norm(provided);return Math.round((100*[...wants].filter(x=>has.has(x)).length/wants.size)*100)/100;
}
function directional(p,u){
  const roles=p.requiredRoles||[];
  const professionOk=!roles.length||norm(roles).has(String(u.profession||"").toLowerCase())?100:0;
  const port=u.portfolio||[];
  const factors={
    genre:coverage(p.genres,u.genres),
    skills:Math.round((0.8*coverage(p.requiredSkills,u.skills)+0.2*professionOk)*100)/100,
    creative:coverage(p.creativeTags,u.creativeTags),
    portfolio:port.length?(coverage(p.genres,port.flatMap(x=>x.genres||[]))+coverage(p.creativeTags,port.flatMap(x=>x.tags||[])))/2:0,
    availability:u.available?100:0
  };
  return {value:Math.round(Object.entries(WEIGHTS).reduce((sum,[k,w])=>sum+w*factors[k],0)*100)/100,factors};
}
function reverse(p,u){
  return Math.round((
    .30*coverage(u.preferredRoles,p.requiredRoles,100)+
    .30*coverage(u.preferredGenres,p.genres,100)+
    .30*coverage(u.preferredTags,p.creativeTags,100)+
    .10*(u.available?100:0))*100)/100;
}
function explanation(factors){
  const strengths=Object.entries(factors).filter(([,v])=>v>=70).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
  const weak=Object.entries(factors).filter(([,v])=>v<40).slice(0,2).map(([k])=>k);
  return (strengths.length?"Strong match on "+strengths.join(", ")+".":"Partial compatibility with the project requirements.")+(weak.length?" Review "+weak.join(", ")+" before inviting.":"");
}
export function rank(project,candidates){
  const ranked=candidates.map(u=>{
    const {value:forward,factors}=directional(project,u);
    const backward=reverse(project,u);
    const genreOnly=coverage(project.genres,u.genres);
    return {id:String(u._id||u.id),score:Math.round(Math.sqrt(forward*backward)*100)/100,
      forward,reverse:backward,factors,explanation:explanation(factors),
      baseline:{genreOnly,profileSimilarity:Math.round((genreOnly+coverage(project.requiredSkills,u.skills))/2*100)/100}};
  }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  return {weights:WEIGHTS,ranked};
}
