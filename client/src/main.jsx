import React,{useEffect,useState} from "react";
import{createRoot}from"react-dom/client";
import "./style.css";

const API=import.meta.env.VITE_API_URL||"http://localhost:4000/api";
function App(){
 const[token,setToken]=useState(localStorage.getItem("ml_token")||"");
 const[me,setMe]=useState(null);
 const[page,setPage]=useState("Projects");
 const[projects,setProjects]=useState([]);
 const[creators,setCreators]=useState([]);
 const[invites,setInvites]=useState([]);
 const[project,setProject]=useState(null);
 const[recs,setRecs]=useState(null);
 const[apps,setApps]=useState([]);
 const[mode,setMode]=useState("blind");
 const[error,setError]=useState("");
 const[notice,setNotice]=useState("");
 const[form,setForm]=useState({});
 const[authMode,setAuthMode]=useState("login");
 const authHeaders={Authorization:"Bearer "+token};
 const request=async(path,opts={})=>{
  const res=await fetch(API+path,{...opts,headers:{"Content-Type":"application/json",...authHeaders,...opts.headers}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||"Request failed");
  return data;
 };
 const safe=async(fn)=>{try{setError("");setNotice("");await fn()}catch(e){setError(e.message)}};
 const refresh=async()=>{const [u,p,c,i]=await Promise.all([request("/me"),request("/projects"),request("/creators"),request("/invitations")]);setMe(u);setProjects(p);setCreators(c);setInvites(i)};
 useEffect(()=>{if(token)refresh().catch(()=>{localStorage.removeItem("ml_token");setToken("");setMe(null)})},[token]);
 const sign=async(e)=>{e.preventDefault();await safe(async()=>{const result=await request("/auth/"+authMode,{method:"POST",body:JSON.stringify(form)});localStorage.setItem("ml_token",result.token);setToken(result.token);setForm({})})};
 const saveProfile=async(e)=>{e.preventDefault();await safe(async()=>{await request("/me",{method:"PUT",body:JSON.stringify({
  displayName:form.displayName??me.displayName,profession:form.profession??me.profession,bio:form.bio??me.bio,
  available:form.available===undefined?me.available:form.available,
  genres:split(form.genres??me.genres),skills:split(form.skills??me.skills),creativeTags:split(form.creativeTags??me.creativeTags),
  preferredRoles:split(form.preferredRoles??me.preferredRoles),preferredGenres:split(form.preferredGenres??me.preferredGenres),preferredTags:split(form.preferredTags??me.preferredTags)
 })});await refresh();setNotice("Profile updated.")})};
 const createProject=async(e)=>{e.preventDefault();await safe(async()=>{await request("/projects",{method:"POST",body:JSON.stringify({
  title:form.title,description:form.description,requiredRoles:split(form.requiredRoles),requiredSkills:split(form.requiredSkills),genres:split(form.genres),creativeTags:split(form.creativeTags)
 })});await refresh();setForm({});setPage("Projects");setNotice("Project created.")})};
 const addPortfolio=async(e)=>{e.preventDefault();await safe(async()=>{await request("/me/portfolio",{method:"POST",body:JSON.stringify({title:form.title,url:form.url,genres:split(form.genres),tags:split(form.tags)})});await refresh();setForm({});setNotice("Portfolio item added.")})};
 const openProject=async(p)=>{setProject(p);setPage("Project details");setRecs(null);setApps([]);setForm({});if(me&&String(p.owner?._id||p.owner)===me.id)await safe(async()=>setApps(await request("/projects/"+p._id+"/applications")))};
 const loadRecommendations=async(selectedMode=mode)=>{await safe(async()=>{setMode(selectedMode);setRecs(await request("/projects/"+project._id+"/recommendations?mode="+selectedMode))})};
 const shortlist=async(id)=>{await safe(async()=>{await request("/projects/"+project._id+"/shortlist",{method:"POST",body:JSON.stringify({candidateId:id})});await loadRecommendations(mode);setNotice("Candidate shortlisted.")})};
 const invite=async(id)=>{await safe(async()=>{await request("/projects/"+project._id+"/invite",{method:"POST",body:JSON.stringify({receiverId:id})});setNotice("Invitation sent.")})};
 const handleInvitation=async(id,status)=>{await safe(async()=>{await request("/invitations/"+id,{method:"PATCH",body:JSON.stringify({status})});await refresh();setNotice("Invitation updated.")})};
 const updateApplication=async(id,status)=>{await safe(async()=>{await request("/applications/"+id,{method:"PATCH",body:JSON.stringify({status})});setApps(await request("/projects/"+project._id+"/applications"))})};
 const logout=()=>{localStorage.removeItem("ml_token");setToken("");setMe(null)};
 const set=(key,value)=>setForm(f=>({...f,[key]:value}));
 const input=(name,label,placeholder="",required=false)=> <label className="field" key={name}><span>{label}</span><input value={form[name]??""} onChange={e=>set(name,e.target.value)} placeholder={placeholder} required={required}/></label>;
 if(!token)return <main className="auth-layout"><div className="hero"><div className="eyebrow">INDEPENDENT MUSIC. BETTER CONNECTIONS.</div><h1>Music<span>Link</span></h1><p>Find creators who match your project, style and creative direction.</p><div className="tags"><span>Creative matching</span><span>Reciprocal compatibility</span><span>Blind review</span></div></div><div className="auth-box"><h2>{authMode==="login"?"Welcome back":"Create your creator account"}</h2><p>Start building with the right people.</p><form onSubmit={sign}>{authMode==="register"&&input("displayName","Display name","Your artist name",true)}{input("email","Email","you@example.com",true)}<label className="field"><span>Password</span><input type="password" minLength={8} value={form.password||""} onChange={e=>set("password",e.target.value)} required /></label><button type="submit">{authMode==="login"?"Sign in":"Create account"}</button></form><button className="link" onClick={()=>{setAuthMode(authMode==="login"?"register":"login");setError("")}}>{authMode==="login"?"New here? Create an account":"Already have an account? Log in"}</button>{error&&<p className="error">{error}</p>}</div></main>;
 return <div className="shell"><aside className="sidebar"><div className="brand">Music<span>Link</span><small>CREATOR NETWORK</small></div><nav>{["Projects","Create project","Creators","My profile","Portfolio","Invitations"].map(p=><button className={page===p?"active":""} onClick={()=>{setPage(p);setForm({});setError("");setNotice("")}} key={p}>{p}</button>)}</nav><div className="account"><strong>{me?.displayName||"Creator"}</strong><small>{me?.profession||"Artist"}</small><button onClick={logout}>Sign out</button></div></aside><main className="content"><header><div><div className="eyebrow">MUSICLINK WORKSPACE</div><h1>{page}</h1></div><span className="pill">{me?.displayName}</span></header>{error&&<div className="error banner">{error}</div>}{notice&&<div className="success banner">{notice}</div>}
 {page==="Projects"&&<><p className="muted">Explore active collaborations and find projects that need your skills.</p><div className="cards">{projects.map(p=><article className="card" key={p._id}><div className="eyebrow">{p.status?.toUpperCase()}</div><h3>{p.title}</h3><p>{p.description||"Seeking independent music collaborators."}</p><div className="tags">{(p.genres||[]).map(x=><span key={x}>{x}</span>)}</div><div className="foot"><small>By {p.owner?.displayName}</small><button onClick={()=>openProject(p)}>View project</button></div></article>)}</div>{projects.length===0&&<div className="empty">No projects yet. Create the first collaboration.</div>}</>}
 {page==="Create project"&&<form className="panel form-grid" onSubmit={createProject}>{input("title","Project title","e.g. New trap single",true)}{input("requiredRoles","Required roles","Producer, Mixing Engineer")}{input("requiredSkills","Required skills","Beat production, Mixing")}{input("genres","Genres","Trap, Hip Hop")}{input("creativeTags","Creative direction","Dark, Energetic")}<label className="field full"><span>Description</span><textarea value={form.description||""} onChange={e=>set("description",e.target.value)} placeholder="Describe your project and what you need"/></label><button type="submit">Publish project</button></form>}
 {page==="Creators"&&<div className="cards">{creators.map(c=><article className="card" key={c.id}><div className="avatar">{c.displayName?.slice(0,1)}</div><h3>{c.displayName}</h3><div className="muted">{c.profession}</div><div className="tags">{c.skills?.slice(0,4).map(x=><span key={x}>{x}</span>)}</div><p>{c.bio}</p></article>)}</div>}
 {page==="My profile"&&me&&<form className="panel form-grid" onSubmit={saveProfile}>{input("displayName","Display name",me.displayName)}{input("profession","Profession",me.profession)}{input("genres","Genres",me.genres?.join(", "))}{input("skills","Skills",me.skills?.join(", "))}{input("creativeTags","Creative tags",me.creativeTags?.join(", "))}{input("preferredRoles","Preferred collaborator roles",me.preferredRoles?.join(", "))}{input("preferredGenres","Preferred genres",me.preferredGenres?.join(", "))}{input("preferredTags","Preferred creative direction",me.preferredTags?.join(", "))}<label className="field"><span>Availability</span><select value={String(form.available??me.available)} onChange={e=>set("available",e.target.value==="true")}><option value="true">Available</option><option value="false">Unavailable</option></select></label><label className="field full"><span>Bio</span><textarea value={form.bio??me.bio??""} onChange={e=>set("bio",e.target.value)}/></label><button type="submit">Save profile</button></form>}
 {page==="Portfolio"&&<><form className="panel form-grid" onSubmit={addPortfolio}>{input("title","Portfolio sample title","e.g. Midnight session",true)}{input("url","Sample URL","https://...",true)}{input("genres","Genres","Trap, Hip Hop")}{input("tags","Creative tags","Dark, Cinematic")}<button type="submit">Add sample</button></form><div className="cards">{me?.portfolio?.map(p=><article className="card" key={p._id}><h3>{p.title}</h3><a href={p.url} target="_blank" rel="noreferrer">Open sample</a></article>)}</div></>}
 {page==="Invitations"&&<div className="cards">{invites.map(i=><article className="card" key={i._id}><h3>{i.project?.title}</h3><p>From {i.sender?.displayName}</p><p>Status: {i.status}</p>{i.status==="pending"&&<div className="row"><button onClick={()=>handleInvitation(i._id,"accepted")}>Accept</button><button className="secondary" onClick={()=>handleInvitation(i._id,"declined")}>Decline</button></div>}</article>)}</div>}
 {page==="Project details"&&project&&<><div className="panel"><div className="eyebrow">PROJECT DETAILS</div><h2>{project.title}</h2><p>{project.description}</p><div className="tags">{[...(project.genres||[]),...(project.requiredRoles||[]),...(project.requiredSkills||[])].map((s,i)=><span key={i}>{s}</span>)}</div>{String(project.owner?._id||project.owner)!==me?.id?<button onClick={()=>safe(async()=>{await request("/projects/"+project._id+"/apply",{method:"POST",body:JSON.stringify({note:"Interested in collaborating."})});setNotice("Application submitted.")})}>Apply to project</button>:<button onClick={()=>loadRecommendations()}>Generate recommendations</button>}</div>
 {String(project.owner?._id||project.owner)===me?.id&&<><div className="row"><button className={mode==="blind"?"":"secondary"} onClick={()=>loadRecommendations("blind")}>Blind review</button><button className={mode==="visible"?"":"secondary"} onClick={()=>loadRecommendations("visible")}>Visible review</button></div>{recs&&<><p className="muted">Scores are experimental. MCCA weighted factors and reciprocal compatibility.</p><div className="cards">{recs.ranked.map(r=><article className="card" key={r.matchId}><div className="score">{r.score.toFixed(1)}<small>/100</small></div><h3>{r.displayName||r.anonymousRef}</h3><p>{r.profession}</p><p>{r.explanation}</p><div className="tags">{Object.entries(r.factors).map(([k,v])=><span key={k}>{k}: {Math.round(v)}</span>)}</div><small>Forward {r.forward}, reverse {r.reverse}</small><br/><small>Genre baseline {r.baseline.genreOnly}, profile baseline {r.baseline.profileSimilarity}</small><div className="row">{!r.shortlisted?<button onClick={()=>shortlist(r.matchId)}>Shortlist</button>:<><span className="pill">Shortlisted</span><button onClick={()=>invite(r.matchId)}>Invite</button></>}</div></article>)}</div></>}{apps.length>0&&<><h2>Project applications</h2><div className="cards">{apps.map(a=><article className="card" key={a._id}><h3>{a.creator?.displayName}</h3><p>{a.creator?.profession}</p><p>Status: {a.status}</p>{a.status==="pending"&&<div className="row"><button onClick={()=>updateApplication(a._id,"accepted")}>Accept</button><button className="secondary" onClick={()=>updateApplication(a._id,"rejected")}>Reject</button></div>}</article>)}</div></>}</>}
 </>}
 </main></div>
}
function split(value){return Array.isArray(value)?value:String(value||"").split(",").map(x=>x.trim()).filter(Boolean)}
createRoot(document.getElementById("root")).render(<App/>);
