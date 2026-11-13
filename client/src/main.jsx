import React,{useEffect,useState} from "react";
import { ArrowUpRight, ArrowLeft, ArrowRight, AudioLines, BriefcaseBusiness, CircleCheck, Compass, Headphones, Mail, Menu, Mic2, Music2, Plus, Radio, Search, Settings2, SlidersHorizontal, Sparkles, UserRound, UsersRound, X, LogOut, Link2, Trash2, ExternalLink, CalendarDays, BadgeCheck, ShieldCheck, ShieldAlert, ClipboardCopy } from "lucide-react";
import{createRoot}from"react-dom/client";
import "./style.css";
import { getMedia } from "./media.js";

const API=import.meta.env.VITE_API_URL||"http://localhost:4000/api";
function App(){
 const[token,setToken]=useState(localStorage.getItem("ml_token")||"");
 const[me,setMe]=useState(null);
 const[page,setPage]=useState("Projects");
 const[projects,setProjects]=useState([]);
 const[creators,setCreators]=useState([]);
 const[invites,setInvites]=useState([]);
 const[sentInvites,setSentInvites]=useState([]);
 const[shortlistEntries,setShortlistEntries]=useState([]);
 const[inviteTab,setInviteTab]=useState("received");
 const[project,setProject]=useState(null);
 const[recs,setRecs]=useState(null);
 const[apps,setApps]=useState([]);
 const[mode,setMode]=useState("blind");
 const[error,setError]=useState("");
 const[notice,setNotice]=useState("");
 const[form,setForm]=useState({});
 const[authMode,setAuthMode]=useState("login");
 const[authBusy,setAuthBusy]=useState(false);
 const[creatorQuery,setCreatorQuery]=useState("");
 const[selectedCreator,setSelectedCreator]=useState(null);
 const[navOpen,setNavOpen]=useState(false);
 const[playing,setPlaying]=useState(null);
 const[myAudio,setMyAudio]=useState([]);
 const[creatorAudio,setCreatorAudio]=useState([]);
 const[audioFile,setAudioFile]=useState(null);
 const[audioTitle,setAudioTitle]=useState("");
 const[audioKind,setAudioKind]=useState("music");
 const[audioBusy,setAudioBusy]=useState(false);
 const[audioPreview,setAudioPreview]=useState(null);
 useEffect(()=>()=>{if(audioPreview?.url)URL.revokeObjectURL(audioPreview.url)},[audioPreview]);
 const[editTrack,setEditTrack]=useState(null);
 const[editProject,setEditProject]=useState(null);
 const[projectFilter,setProjectFilter]=useState("open");
 const[applicationNote,setApplicationNote]=useState("");
 const[myApplications,setMyApplications]=useState([]);
 const[verification,setVerification]=useState(null);
 const[verificationForm,setVerificationForm]=useState({platform:"website",artistName:"",officialUrl:"",notes:""});
 const[verificationQueue,setVerificationQueue]=useState([]);
 const[verificationQueueStatus,setVerificationQueueStatus]=useState("pending");
 const[reviewNotes,setReviewNotes]=useState({});
 const[reviewConfirmed,setReviewConfirmed]=useState({});
 const[verifyBusy,setVerifyBusy]=useState(false);
 const authHeaders={Authorization:"Bearer "+token};
 const request=async(path,opts={})=>{
  const res=await fetch(API+path,{...opts,headers:{"Content-Type":"application/json",...(path.startsWith("/auth/")?{}:authHeaders),...opts.headers}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok){const error=new Error(data.error||"Request failed");error.status=res.status;throw error;}
  return data;
 };
 const safe=async(fn)=>{try{setError("");setNotice("");await fn()}catch(e){setError(e.message)}};
 const refresh=async()=>{const [u,p,c,i,a,s,v,audio]=await Promise.all([request("/me"),request("/projects"),request("/creators"),request("/invitations"),request("/me/applications"),request("/me/sent-invitations"),request("/verification/mine"),request("/me/audio")]);setMe(u);setProjects(p);setCreators(c);setInvites(i);setMyApplications(a);setSentInvites(s);setVerification(v);setMyAudio(audio);
 if(u.role==="admin"){setVerificationQueue(await request("/verification/admin/queue?status="+verificationQueueStatus));}else setVerificationQueue([]);
};
 useEffect(()=>{if(token)refresh().catch(e=>{if(e.status===401){localStorage.removeItem("ml_token");setToken("");setMe(null)}else{setError("Unable to connect. Your session is still saved. Please refresh the page.")}})},[token]);
 const sign=async(e)=>{e.preventDefault();if(authBusy)return;setAuthBusy(true);try{await safe(async()=>{if(authMode==="register"&&form.password!==form.confirmPassword)throw new Error("Passwords do not match.");const {confirmPassword,...details}=form;const result=await request("/auth/"+authMode,{method:"POST",body:JSON.stringify(details)});localStorage.setItem("ml_token",result.token);setToken(result.token);setForm({})})}finally{setAuthBusy(false)}};
 const saveProfile=async(e)=>{e.preventDefault();await safe(async()=>{await request("/me",{method:"PUT",body:JSON.stringify({
  displayName:form.displayName??me.displayName,profession:form.profession??me.profession,bio:form.bio??me.bio,avatarUrl:form.avatarUrl??me.avatarUrl??"",
  available:form.available===undefined?me.available:form.available,
  genres:split(form.genres??me.genres),skills:split(form.skills??me.skills),creativeTags:split(form.creativeTags??me.creativeTags),
  preferredRoles:split(form.preferredRoles??me.preferredRoles),preferredGenres:split(form.preferredGenres??me.preferredGenres),preferredTags:split(form.preferredTags??me.preferredTags)
 })});await refresh();setNotice("Profile updated.")})};
 const createProject=async(e)=>{e.preventDefault();await safe(async()=>{
 const data={title:form.title,description:form.description||"",requiredRoles:split(form.requiredRoles),requiredSkills:split(form.requiredSkills),genres:split(form.genres),creativeTags:split(form.creativeTags),targetDate:form.targetDate||null};
 const updated=await request(editProject?"/projects/"+editProject:"/projects",{method:editProject?"PATCH":"POST",body:JSON.stringify(data)});
 await refresh();setEditProject(null);setForm({});setPage("Projects");setNotice(editProject?"Project updated.":"Project published.");
 if(editProject&&project?._id===editProject)setProject(updated);
 })};
 const addPortfolio=async(e)=>{e.preventDefault();await safe(async()=>{
 const data={title:form.title,url:form.url,genres:split(form.genres),tags:split(form.tags),role:form.role||"",description:form.description||"",releaseYear:form.releaseYear||null};
 await request(editTrack?"/me/portfolio/"+editTrack:"/me/portfolio",{method:editTrack?"PATCH":"POST",body:JSON.stringify(data)});
 await refresh();setEditTrack(null);setForm({});setNotice(editTrack?"Sample updated.":"Sample added.");
 })};
 const openProject=async(p)=>{setProject(p);setPage("Project details");setRecs(null);setApps([]);setShortlistEntries([]);setForm({});setApplicationNote("");
 if(me&&String(p.owner?._id||p.owner)===me.id)await safe(async()=>{
 const [applications,shortlisted]=await Promise.all([request("/projects/"+p._id+"/applications"),request("/projects/"+p._id+"/shortlist")]);
 setApps(applications);setShortlistEntries(shortlisted);
 });
 };
 const beginEditProject=(p)=>{setEditProject(p._id);setForm({title:p.title,description:p.description||"",requiredRoles:(p.requiredRoles||[]).join(", "),requiredSkills:(p.requiredSkills||[]).join(", "),genres:(p.genres||[]).join(", "),creativeTags:(p.creativeTags||[]).join(", "),targetDate:p.targetDate?p.targetDate.slice(0,10):""});setPage("Create project")};
 const updateProjectStatus=async(nextStatus)=>{await safe(async()=>{const changed=await request("/projects/"+project._id,{method:"PATCH",body:JSON.stringify({status:nextStatus})});setProject({...project,...changed});await refresh();setNotice(nextStatus==="closed"?"Project closed to new applications.":"Project reopened.")})};
 const applyToProject=async()=>{await safe(async()=>{await request("/projects/"+project._id+"/apply",{method:"POST",body:JSON.stringify({note:applicationNote})});setApplicationNote("");await loadMyApplications();setNotice("Application submitted.")})};
 const loadMyApplications=async()=>{setMyApplications(await request("/me/applications"))};
 const loadRecommendations=async(selectedMode=mode)=>{await safe(async()=>{setMode(selectedMode);setRecs(await request("/projects/"+project._id+"/recommendations?mode="+selectedMode))})};
 const loadShortlist=async()=>setShortlistEntries(await request("/projects/"+project._id+"/shortlist"));
 const shortlist=async(id)=>{await safe(async()=>{await request("/projects/"+project._id+"/shortlist",{method:"POST",body:JSON.stringify({candidateId:id})});await Promise.all([loadRecommendations(mode),loadShortlist()]);setNotice("Creator added to your shortlist.")})};
 const removeShortlist=async(id)=>{await safe(async()=>{await request("/projects/"+project._id+"/shortlist/"+id,{method:"DELETE"});await Promise.all([loadRecommendations(mode),loadShortlist()]);setNotice("Creator removed from shortlist.")})};
 const invite=async(id)=>{await safe(async()=>{await request("/projects/"+project._id+"/invite",{method:"POST",body:JSON.stringify({receiverId:id})});await Promise.all([loadShortlist(),refresh()]);setNotice("Invitation sent. Its status appears below.")})};
 const handleInvitation=async(id,status)=>{await safe(async()=>{await request("/invitations/"+id,{method:"PATCH",body:JSON.stringify({status})});await refresh();setNotice(status==="accepted"?"Collaboration accepted.":"Invitation declined.")})};
 const updateApplication=async(id,status)=>{await safe(async()=>{await request("/applications/"+id,{method:"PATCH",body:JSON.stringify({status})});setApps(await request("/projects/"+project._id+"/applications"));setNotice("Application "+status+".")})};
 const submitVerification=async(e)=>{e.preventDefault();if(verifyBusy)return;setVerifyBusy(true);try{await safe(async()=>{
  await request("/verification/request",{method:"POST",body:JSON.stringify({artistName:verificationForm.artistName.trim(),platform:verificationForm.platform,officialUrl:verificationForm.officialUrl.trim(),notes:verificationForm.notes.trim()})});
  setVerification(await request("/verification/mine"));setNotice("Request submitted. Add the ownership code to your official channel or page for review.");
 })}finally{setVerifyBusy(false)}};
 const chooseReviewQueue=async(status)=>{await safe(async()=>{setVerificationQueueStatus(status);setVerificationQueue(await request("/verification/admin/queue?status="+status))})};
 const reviewVerification=async(item,decision)=>{await safe(async()=>{
  const body={decision,confirmedOwnership:reviewConfirmed[item.id]===true,reason:(reviewNotes[item.id]||"").trim()};
  await request("/verification/admin/"+item.id,{method:"PATCH",body:JSON.stringify(body)});
  setVerificationQueue(await request("/verification/admin/queue?status="+verificationQueueStatus));await refresh();
  setNotice("Verification "+(decision==="approve"?"approved.":"rejected."));
 })};
 const revokeVerification=async(item)=>{await safe(async()=>{const reason=(reviewNotes[item.id]||"").trim();await request("/verification/admin/"+item.id+"/revoke",{method:"POST",body:JSON.stringify({reason})});setVerificationQueue(await request("/verification/admin/queue?status=approved"));await refresh();setNotice("Artist badge revoked.")})};
 const submitAudio=async(e)=>{e.preventDefault();if(audioBusy)return;setAudioBusy(true);await safe(async()=>{
 if(!audioFile)throw new Error("Select an MP3 or WAV file.");
 if(audioFile.size>2*1024*1024||audioFile.size<44)throw new Error("Audio must be under 2 MB.");
 if(!["audio/mpeg","audio/mp3","audio/wav","audio/x-wav","audio/wave"].includes(audioFile.type))throw new Error("Select MP3 or WAV audio.");
 const path="/me/audio?title="+encodeURIComponent(audioTitle.trim())+"&kind="+encodeURIComponent(audioKind);
 const response=await fetch(API+path,{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":audioFile.type},body:audioFile});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||"Upload failed.");
 setMyAudio(await request("/me/audio"));setAudioFile(null);setAudioTitle("");
 const fileInput=document.getElementById("ml-audio-file");if(fileInput)fileInput.value="";
 setNotice("Audio sample uploaded. Open its preview below.");
 });setAudioBusy(false)};
 const deleteAudio=async(id)=>{await safe(async()=>{
 await request("/me/audio/"+id,{method:"DELETE"});
 setMyAudio(await request("/me/audio"));
 if(audioPreview?.id===id)setAudioPreview(null);
 setNotice("Audio sample removed.");
 })};
 const previewAudio=async(id)=>{await safe(async()=>{
 if(audioPreview?.id===id){setAudioPreview(null);return}
 const response=await fetch(API+"/audio/"+id,{headers:{Authorization:"Bearer "+token}});
 if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||"Audio unavailable.");}
 const blob=await response.blob();
 setAudioPreview({id,url:URL.createObjectURL(blob)});
 })};
 const openCreator=async(c)=>{setSelectedCreator(c);setCreatorAudio([]);setAudioPreview(null);
 await safe(async()=>setCreatorAudio(await request("/creators/"+c.id+"/audio")));
 };
 const logout=()=>{localStorage.removeItem("ml_token");setToken("");setMe(null);setVerification(null);setVerificationQueue([]);setMyAudio([]);setCreatorAudio([]);setAudioPreview(null)};
 const featureTrack=async(id)=>{await safe(async()=>{await request("/me/portfolio/"+id+"/feature",{method:"PATCH"});await refresh();setNotice("Featured track updated.")})};
 const beginEditTrack=(track)=>{setEditTrack(track._id);setForm({title:track.title,url:track.url,genres:(track.genres||[]).join(", "),tags:(track.tags||[]).join(", "),description:track.description||"",role:track.role||"",releaseYear:track.releaseYear||""});setPlaying(null)};
 const removePortfolio=async(id)=>{await safe(async()=>{await request("/me/portfolio/"+id,{method:"DELETE"});await refresh();setNotice("Portfolio sample removed.")})};
 const go=(destination)=>{setPage(destination);setSelectedCreator(null);setAudioPreview(null);setNavOpen(false);setForm({});setEditProject(null);setError("");setNotice("");if(destination==="Projects")loadMyApplications().catch(()=>{})};
 const set=(key,value)=>setForm(f=>({...f,[key]:value}));
 const input=(name,label,placeholder="",required=false)=> <label className="field" key={name}><span>{label}</span><input value={form[name]??""} onChange={e=>set(name,e.target.value)} placeholder={placeholder} required={required}/></label>;

 const brand=<span className="brand-lockup"><img className="brand-symbol" src="/musiclink-mark.webp" alt="" aria-hidden="true"/><span className="wordmark">Music<span>Link</span></span></span>;
 const navItems=[["Projects",Compass],["Create project",Plus],["Creators",UsersRound],["My profile",UserRound],["Portfolio",Music2],["Invitations",Mail],...(me?.role==="admin"?[["Verify artists",ShieldCheck]]:[])];
 const pageNo=String(Math.max(1,navItems.findIndex(item=>item[0]===page)+1)).padStart(2,"0");
 const pageCopy={
  "Projects":{overline:"PROJECTS",heading:"Find your next",accent:"session.",description:"Browse collaborations from independent musicians."},
  "Create project":{overline:"START SOMETHING",heading:"Put your idea",accent:"out there.",description:"Describe your project and find collaborators."},
  "Creators":{overline:"THE PEOPLE",heading:"Behind the",accent:"sound.",description:"Find artists, producers and engineers."},
  "My profile":{overline:"YOUR IDENTITY",heading:"Your sound.",accent:"Your story.",description:"Share your music, skills and availability."},
  "Portfolio":{overline:"YOUR WORK",heading:"Let the music",accent:"speak.",description:"Add your songs, demos and previous work."},
  "Invitations":{overline:"YOUR CONNECTIONS",heading:"Good things start",accent:"together.",description:"Review your project invitations."},
  "Project details":{overline:"COLLABORATION DETAIL",heading:"The next",accent:"move.",description:"View the project and choose collaborators."},
  "Verify artists":{overline:"TRUST AND IDENTITY",heading:"Artist review",accent:"queue.",description:"Review official ownership evidence before granting a badge."}
 };
 const activeCopy=pageCopy[page]||pageCopy.Projects;
 const currentUser=me?.displayName||"Creator";
 const avatarColor=(name)=>["linear-gradient(135deg,#7141f2,#0aa3e0)","linear-gradient(135deg,#b044f0,#5359e0)","linear-gradient(135deg,#226ad8,#1dc6e8)","linear-gradient(135deg,#6835be,#cc4dc7)"][Array.from(name||"A").reduce((s,c)=>s+c.charCodeAt(0),0)%4];
 const badge=(items)=><div className="chips">{(items||[]).slice(0,5).map((x,i)=><span key={x+i}>{x}</span>)}</div>;
 const verifiedBadge=(u)=>u?.verified?<span className="artist-verified" title="Artist ownership reviewed by MusicLink"><BadgeCheck size={15} strokeWidth={2.3}/> MusicLink Verified</span>:null;
 const showOwner=(p)=>String(p.owner?._id||p.owner)===me?.id;
 const empty=(icon,title,description,buttonLabel,onClick)=><div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{buttonLabel&&<button className="btn-outline" onClick={onClick}>{buttonLabel}<ArrowUpRight size={16}/></button>}</div>;
 const detail=(label,value,placeholder)=>input(label.toLowerCase().replaceAll(" ",""),label,value||placeholder||"");
 if(!token)return <div className="auth-layout">
   <section className="auth-visual">
     <img className="auth-photo" src="https://images.unsplash.com/photo-1634286051376-940ff8525141?auto=format&fit=crop&w=1400&q=82" alt="Recording studio with a microphone and music keyboards" />
     <div className="auth-shade"/>
     <div className="auth-top"><div className="auth-brand">{brand}</div><div className="editorial-no">THE INDEPENDENT CREATIVE NETWORK · EST. 2026</div></div>
     <div className="auth-feature"><div className="eyebrow light-kicker"><span className="kicker-line"/>AN OPEN SPACE FOR ORIGINAL MUSIC</div><h1>Good music<br/><em>starts together.</em></h1><p>A home for the voices, ideas, and people behind the records.</p><div className="auth-visual-bottom"><span><AudioLines size={19}/> AN INDEPENDENT MUSIC COLLABORATION SPACE</span><span className="visual-index">SIDE A / 001</span></div></div>
   </section>
   <section className="auth-pane"><div className="auth-mobile-brand">{brand}</div><div className="auth-box"><div className="eyebrow">WELCOME TO MUSICLINK</div><h2>{authMode==="login"?"Welcome back.":"Make your next connection."}</h2><p>{authMode==="login"?"Sign in to continue.":"Create your profile and connect with musicians."}</p><form onSubmit={sign}>
   {authMode==="register"&&input("displayName","Artist or creator name","How should people know you?",true)}
   <label className="field"><span>Email address</span><input type="email" autoComplete="email" maxLength={254} value={form.email||""} onChange={e=>set("email",e.target.value)} placeholder="you@example.com" required /></label>
   <label className="field"><span>Password</span><input type="password" autoComplete={authMode==="register"?"new-password":"current-password"} minLength={authMode==="register"?10:undefined} maxLength={128} value={form.password||""} onChange={e=>set("password",e.target.value)} placeholder={authMode==="register"?"At least 10 characters":"Enter your password"} required /></label>
   {authMode==="register"&&<label className="field"><span>Confirm password</span><input type="password" autoComplete="new-password" minLength={10} value={form.confirmPassword||""} onChange={e=>set("confirmPassword",e.target.value)} placeholder="Enter your password again" required /></label>}
   <button type="submit" className="btn-primary auth-submit" disabled={authBusy}>{authBusy?"One moment...":authMode==="login"?"Sign in to MusicLink":"Create your account"}<ArrowRight size={17}/></button></form>
   <div className="switch-auth">{authMode==="login"?"New to MusicLink?":"Already part of MusicLink?"}<button className="text-link" onClick={()=>{setAuthMode(authMode==="login"?"register":"login");setForm({});setError("")}}>{authMode==="login"?"Join the community":"Sign in"}</button></div>
   {error&&<div className="message error">{error}</div>}</div><div className="auth-footer"><span>Built for independent music.</span><span>MusicLink / 2026</span></div></section>
 </div>;
 return <div className="workspace">
   <button className="mobile-menu" aria-label={navOpen?"Close navigation":"Open navigation"} onClick={()=>setNavOpen(!navOpen)}>{navOpen?<X size={21}/>:<Menu size={21}/>}</button>
   {navOpen&&<button className="mobile-overlay" aria-label="Close navigation" onClick={()=>setNavOpen(false)}/>}
   <aside className={"sidebar "+(navOpen?"sidebar-open":"")} aria-label="Main navigation">
     <button className="sidebar-brand" onClick={()=>go("Projects")}>{brand}<span>INDEPENDENT MUSIC</span></button>
     <div className="sidebar-label">THE MUSIC MAKERS INDEX <span>001 / 006</span></div>
     <nav>{navItems.map(([name,Icon])=><button key={name} className={"nav-item "+(page===name?"active":"")} onClick={()=>go(name)}><Icon size={18} strokeWidth={1.8}/><span>{name}</span>{page===name&&<span className="nav-active-mark"/>}</button>)}</nav>
     <div className="sidebar-bottom">
       <div className="account"><div className="small-avatar" style={{background:avatarColor(currentUser)}}>{currentUser.charAt(0).toUpperCase()}</div><div className="account-label"><strong>{currentUser}</strong><span>{me?.profession||"Independent creator"}</span></div><button onClick={logout} className="logout" aria-label="Sign out" title="Sign out"><LogOut size={18}/></button></div>
     </div>
   </aside>
   <main className="main-area">
     <div className="topbar"><div className="top-left"><span className="topbar-issue">MUSICLINK®</span><span className="topbar-divider">/</span><span>THE INDEPENDENT SOUND NETWORK</span></div><div className="top-right"><span className="topbar-section">EDITION 001 · {pageNo} / 06</span><span className="top-live"><i/>ONLINE</span><button className="top-avatar" style={{background:avatarColor(currentUser)}} onClick={()=>go("My profile")} aria-label="Open your profile">{currentUser.charAt(0).toUpperCase()}</button></div></div>
     <div className="page-body">
      <div className={"page-heading editorial-heading "+(page==="Projects"||page==="Creators"?"has-feature-art":"")}>
 <div className="heading-index"><span>{pageNo} / MUSICLINK</span><span>FOR PEOPLE WHO MAKE MUSIC</span></div>
 <div className="heading-row"><div className="heading-copy"><div className="eyebrow"><span className="kicker-line"/>{activeCopy.overline}</div><h1>{activeCopy.heading}<br/><em>{activeCopy.accent}</em></h1><p>{activeCopy.description}</p><div className="heading-lower"><span className="heading-asterisk" aria-hidden="true">✳</span><span>CONNECTION IS THE START OF SOMETHING GOOD.</span>{page==="Projects"&&<button className="btn-primary heading-action" onClick={()=>go("Create project")}>Post a project <ArrowUpRight size={18}/></button>}{page==="Creators"&&<button className="btn-primary heading-action" onClick={()=>go("Create project")}>Start a collaboration <ArrowUpRight size={18}/></button>}</div></div>
 {(page==="Projects"||page==="Creators")&&<div className="editorial-cover" aria-hidden="true"><img src={page==="Projects"?"https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=85":"https://images.unsplash.com/photo-1535732850099-99177944f4c5?auto=format&fit=crop&w=900&q=85"} alt=""/><span className="cover-stamp">ML / {pageNo}</span><div className="cover-caption"><AudioLines size={19}/> MAKE MORE TOGETHER</div></div>}
 </div><div className="heading-rule"><span>CREATIVE PEOPLE. REAL PROJECTS.</span><span>SCROLL TO EXPLORE <ArrowRight size={15}/></span></div></div>
      {error&&<div className="message error"><X size={16}/>{error}</div>}{notice&&<div className="message success"><CircleCheck size={17}/>{notice}</div>}
      {page==="Projects"&&<>
 <div className="editorial-marquee" aria-hidden="true"><div className="marquee-track">{Array.from({length:4},(_,i)=><span key={i}>CREATORS <b>✳</b> COLLABORATION <b>✳</b> NEW SOUNDS <b>✳</b> NO BOUNDARIES <b>✳</b></span>)}</div></div>
 <div className="project-tabs"><button className={projectFilter==="open"?"selected":""} onClick={()=>setProjectFilter("open")}>Open projects</button><button className={projectFilter==="mine"?"selected":""} onClick={()=>setProjectFilter("mine")}>My projects</button><button className={projectFilter==="all"?"selected":""} onClick={()=>setProjectFilter("all")}>All projects</button></div>
 <div className="section-heading"><div><span className="section-index">PROJECT BOARD</span><h2>{projectFilter==="mine"?"Your projects":projectFilter==="all"?"All collaborations":"Open collaborations"} <span className="count-number">{projects.filter(p=>projectFilter==="mine"?showOwner(p):projectFilter==="all"||p.status==="open").length}</span></h2></div></div>
 {projects.filter(p=>projectFilter==="mine"?showOwner(p):projectFilter==="all"||p.status==="open").length?<div className="cards project-grid">
 {projects.filter(p=>projectFilter==="mine"?showOwner(p):projectFilter==="all"||p.status==="open").map((p,i)=><article className="project-card" key={p._id}>
 <div className="project-card-top"><span>OPEN CALL / {String(i+1).padStart(2,"0")}</span><span className={"status-dot "+(p.status==="open"?"is-open":"")}>{p.status}</span></div>
 <div className="project-art"><div className="project-art-inner"><AudioLines size={42} strokeWidth={1}/></div><span className="project-art-corner">ML — {String(i+1).padStart(2,"0")}</span></div>
 <div className="project-meta">{showOwner(p)?"YOUR PROJECT":"BY "+(p.owner?.displayName||"CREATOR")}</div><h3>{p.title}</h3><p>{p.description||"Independent music collaboration."}</p>{badge(p.genres)}
 {p.targetDate&&<p className="project-date"><CalendarDays size={13}/> Target {new Date(p.targetDate).toLocaleDateString()}</p>}
 <div className="card-bottom"><span>{(p.requiredRoles||[]).slice(0,2).join(" · ")||"Open call"}</span><button className="arrow-button" aria-label={"Explore "+p.title} onClick={()=>openProject(p)}><ArrowUpRight size={20}/></button></div>
 </article>)}</div>:empty(<AudioLines size={26}/>,"No matching projects.","Try another filter or publish your own project.","Create project",()=>go("Create project"))}
 {myApplications.length>0&&<div className="my-applications"><div className="section-heading"><div><span className="section-index">YOUR REQUESTS</span><h2>My applications <span className="count-number">{myApplications.length}</span></h2></div></div>{myApplications.map(a=><div className="my-application-row" key={a._id}><div><strong>{a.project?.title||"Project"}</strong><span>{a.note||"Application submitted"}</span></div><span className={"application-status status-"+a.status}>{a.status}</span></div>)}</div>}
 </>}
 {page==="Create project"&&<div className="form-panel project-form"><div className="form-head"><span className="section-index">{editProject?"EDIT PROJECT":"NEW PROJECT"}</span><h2>{editProject?"Update your project":"Share a project"}</h2><p>Tell other musicians what you are making and who you need.</p></div>
 <form className="form-grid" onSubmit={createProject}>
 {input("title","Project title","e.g. Midnight Sessions",true)}
 {input("requiredRoles","Collaborators needed","Producer, Singer, Engineer")}
 {input("requiredSkills","Required skills","Beat making, Mixing")}
 {input("genres","Genres","Trap, Hip Hop")}
 {input("creativeTags","Sound and mood","Dark, Melodic")}
 <label className="field"><span>Target completion date (optional)</span><input type="date" value={form.targetDate||""} onChange={e=>set("targetDate",e.target.value)}/></label>
 <label className="field full"><span>Project brief</span><textarea maxLength={2000} value={form.description||""} onChange={e=>set("description",e.target.value)} placeholder="Describe what you are working on, and what you expect from collaborators."/></label>
 <div className="project-form-actions"><button className="btn-primary" type="submit">{editProject?"Save changes":"Publish project"} <ArrowRight size={16}/></button>{editProject&&<button type="button" className="btn-outline" onClick={()=>{setEditProject(null);setForm({});go("Projects")}}>Cancel</button>}</div>
 </form></div>}
 {page==="Creators"&&<>
        <div className="directory-toolbar"><div className="directory-search"><Search size={19}/><input value={creatorQuery} onChange={e=>setCreatorQuery(e.target.value)} placeholder="Search by name, genre or skill..." aria-label="Search creators"/></div><span>{creators.filter(c=>[c.displayName,c.profession,c.bio,...(c.genres||[]),...(c.skills||[])].join(" ").toLowerCase().includes(creatorQuery.toLowerCase())).length} CREATORS</span></div>
        {selectedCreator?<div className="creator-detail"><button className="back-link" onClick={()=>{setSelectedCreator(null);setAudioPreview(null);setCreatorAudio([])}}><ArrowLeft size={17}/> All creators</button><div className="creator-detail-cover"><img src="https://images.unsplash.com/photo-1634286051376-940ff8525141?auto=format&fit=crop&w=1000&q=75" alt="Recording studio atmosphere"/></div><div className="creator-detail-body"><div className="creator-detail-avatar" style={{background:avatarColor(selectedCreator.displayName)}}>{selectedCreator.avatarUrl?<img loading="lazy" src={selectedCreator.avatarUrl} alt={selectedCreator.displayName+" profile photo"}/>:selectedCreator.displayName?.charAt(0).toUpperCase()}</div><span className={"availability "+(selectedCreator.available?"available":"unavailable")}>{selectedCreator.available?"OPEN TO COLLABORATE":"CURRENTLY UNAVAILABLE"}</span><h2>{selectedCreator.displayName} {verifiedBadge(selectedCreator)}</h2><p className="creator-role">{selectedCreator.profession||"Independent artist"}</p><p>{selectedCreator.bio||"This creator hasn't shared their story yet."}</p><div className="creator-spec"><div><span>GENRES</span>{badge(selectedCreator.genres)}</div><div><span>SKILLS</span>{badge(selectedCreator.skills)}</div><div><span>CREATIVE DIRECTION</span>{badge(selectedCreator.creativeTags)}</div></div><div className="creator-audio-showcase"><h3>Audio samples</h3><p>Original music and vocal excerpts uploaded by this creator.</p>{creatorAudio.length?<div className="audio-sample-list">{creatorAudio.map(sample=><div className="audio-sample" key={sample.id}><div className="audio-sample-main"><div className="audio-sample-icon"><AudioLines size={20}/></div><div><strong>{sample.title}</strong><span>{sample.kind==="vocal"?"VOCAL":"MUSIC"} · {(sample.byteSize/1024).toFixed(0)} KB</span></div><button className="btn-outline" type="button" onClick={()=>previewAudio(sample.id)}>{audioPreview?.id===sample.id?"Close":"Listen"} <Headphones size={14}/></button></div>{audioPreview?.id===sample.id&&<audio className="audio-native-player" controls preload="metadata" src={audioPreview.url}>Your browser does not support audio playback.</audio>}</div>)}</div>:<p>No uploaded audio samples yet.</p>}</div>
 <div className="creator-work"><h3>Selected work</h3>{(selectedCreator.portfolio||[]).length?(selectedCreator.portfolio||[]).map(a=>{const media=getMedia(a.url);const key=a._id||a.url;return <div className="creator-track" key={key}><div className="creator-track-main"><Music2 size={16}/><span>{a.title}{a.role&&<small>{a.role}</small>}</span>{a.featured&&<span className="featured-label">FEATURED</span>}</div><div className="creator-track-actions">{media.embed&&<button type="button" onClick={()=>setPlaying(playing===key?null:key)}>{playing===key?"Close":"Preview"}</button>}<a href={a.url} target="_blank" rel="noopener noreferrer" aria-label={"Open "+a.title}><ExternalLink size={15}/></a></div>{playing===key&&media.embed&&<div className="player-frame"><iframe title={"Preview "+a.title} src={media.embed} loading="lazy" allow="encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"/></div>}</div>}):<p>No portfolio samples shared yet.</p>}</div></div></div>:
        <>{creators.filter(c=>[c.displayName,c.profession,c.bio,...(c.genres||[]),...(c.skills||[])].join(" ").toLowerCase().includes(creatorQuery.toLowerCase())).length>0?<div className="cards creators-grid">{creators.filter(c=>[c.displayName,c.profession,c.bio,...(c.genres||[]),...(c.skills||[])].join(" ").toLowerCase().includes(creatorQuery.toLowerCase())).map((c,i)=><article className="creator-card" key={c.id}><div className="creator-card-top"><span>CREATOR / {String(i+1).padStart(2,"0")}</span><span className={"availability "+(c.available?"available":"unavailable")}>{c.available?"AVAILABLE":"UNAVAILABLE"}</span></div><div className="creator-identity"><div className="creator-avatar" style={{background:avatarColor(c.displayName)}}>{c.avatarUrl?<img loading="lazy" src={c.avatarUrl} alt={c.displayName+" profile photo"}/>:c.displayName?.charAt(0).toUpperCase()}</div><div><h3>{c.displayName} {verifiedBadge(c)}</h3><span>{c.profession||"Independent creator"}</span></div></div><p>{c.bio||"An independent creator finding their next collaboration."}</p>{badge([...(c.genres||[]).slice(0,2),...(c.skills||[]).slice(0,2)])}<button className="creator-explore" onClick={()=>openCreator(c)}>View creator profile <ArrowUpRight size={18}/></button></article>)}</div>:empty(<UsersRound size={28}/>,"No creators found","Try another search.",creatorQuery?"Clear search":null,()=>setCreatorQuery(""))}</>}
      </>}
      {page==="My profile"&&me&&<div className="profile-wrap"><div className="profile-cover"><img src="https://images.unsplash.com/photo-1634286051376-940ff8525141?auto=format&fit=crop&w=1500&q=80" alt="Recording studio keyboards and microphone"/><span>YOUR CREATOR IDENTITY</span></div><div className="profile-summary"><div className="profile-avatar" style={{background:avatarColor(me.displayName)}}>{me.avatarUrl?<img loading="lazy" src={me.avatarUrl} alt={me.displayName+" profile photo"}/>:me.displayName?.charAt(0).toUpperCase()}</div><div><h2>{me.displayName} {verifiedBadge(me)}</h2><span>{me.profession||"Independent creator"}</span></div><div className={"availability "+(me.available?"available":"unavailable")}>{me.available?"AVAILABLE FOR WORK":"NOT AVAILABLE"}</div></div><div className="form-panel profile-form"><div className="form-head"><div className="profile-progress">PROFILE {me.completeness??0}% COMPLETE</div><span className="section-index">01 / PERSONAL DETAILS</span><h2>Give your profile a voice.</h2><p>Tell people what you make and what you need.</p></div><form className="form-grid" onSubmit={saveProfile}>
        {input("displayName","Artist / creator name",me.displayName)}<label className="field"><span>Profile photo URL (HTTPS)</span><input type="url" value={form.avatarUrl??me.avatarUrl??""} onChange={e=>set("avatarUrl",e.target.value)} placeholder="https://example.com/photo.jpg"/></label>
        <label className="field"><span>Your role</span><input list="profession-suggestions" value={form.profession??""} onChange={e=>set("profession",e.target.value)} placeholder={me.profession||"e.g. Music Producer"}/><datalist id="profession-suggestions">{["Artist","Rapper","Singer","Music Producer","Beat Maker","Mixing Engineer","Mastering Engineer","Lyricist","Songwriter","Instrumentalist","DJ"].map(x=><option key={x} value={x}/>)}</datalist></label>
        <label className="field full"><span>About your sound</span><textarea value={form.bio??me.bio??""} onChange={e=>set("bio",e.target.value)} maxLength={1500} placeholder="What do you create? What inspires your music?"/><small>Keep it personal, specific and true to your work.</small></label>
        <div className="form-divider"><span>02 / YOUR CREATIVE WORLD</span><p>Separate multiple entries with commas.</p></div>
        {input("genres","Genres",me.genres?.join(", ")||"Trap, Hip Hop, R&B")}
        {input("skills","Your skills",me.skills?.join(", ")||"Production, Mixing, Writing")}
        {input("creativeTags","Your sound in words",me.creativeTags?.join(", ")||"Dark, Melodic, Experimental")}
        <label className="field"><span>Open to work?</span><select value={String(form.available??me.available)} onChange={e=>set("available",e.target.value==="true")}><option value="true">Yes, I'm open to collaborating</option><option value="false">Not taking new collaborations</option></select></label>
        <div className="form-divider"><span>03 / WHAT YOU'RE LOOKING FOR</span><p>Tell MusicLink who you'd like to work with.</p></div>
        {input("preferredRoles","Preferred collaborator roles",me.preferredRoles?.join(", ")||"Producer, Singer")}
        {input("preferredGenres","Preferred genres",me.preferredGenres?.join(", ")||"Trap, Alternative")}
        {input("preferredTags","Preferred creative direction",me.preferredTags?.join(", ")||"Atmospheric, Raw")}
        <button className="btn-primary" type="submit">Save your profile <ArrowRight size={17}/></button>
      </form></div>
 <section className="verification-panel"><div className="form-head"><span className="section-index">04 / AUTHENTIC ARTIST IDENTITY</span><h2>Artist verification.</h2><p>Official artist accounts are reviewed by MusicLink. Linking a Spotify or YouTube page alone does not verify ownership.</p></div>
 {me.verified?<div className="verified-approved"><BadgeCheck size={22}/><div><strong>MusicLink Verified</strong><p>Your artist identity has passed an ownership review. Verified artist name: {me.artistName||me.displayName}.</p></div></div>:
 verification?.status==="pending"?<div className="verification-pending"><div className="verify-status"><ShieldAlert size={17}/> PENDING ADMIN REVIEW</div><h3>Prove you control your artist account.</h3><p>Add this one-time code in the public bio or description of your official website or artist channel. Leave it visible until the administrator checks it.</p><div className="verify-proof"><code>{verification.proofCode}</code><button type="button" className="btn-outline" onClick={()=>navigator.clipboard?.writeText(verification.proofCode).then(()=>setNotice("Proof code copied.")).catch(()=>setError("Copy the code manually."))}><ClipboardCopy size={15}/> Copy</button></div><p>Official page: <a href={verification.officialUrl} target="_blank" rel="noopener noreferrer">{verification.officialUrl}</a></p><p>We review ownership evidence manually. No badge appears before approval.</p></div>:
 <form className="verification-form" onSubmit={submitVerification}>
 {verification?.reviewReason&&<p className="verify-rejection">Previous review: {verification.status}. {verification.reviewReason}</p>}
 <div className="form-grid"><label className="field"><span>Artist or stage name</span><input required minLength={2} maxLength={80} value={verificationForm.artistName} placeholder={me.displayName||"Your artist name"} onChange={e=>setVerificationForm(v=>({...v,artistName:e.target.value}))}/></label>
 <label className="field"><span>Official platform</span><select value={verificationForm.platform} onChange={e=>setVerificationForm(v=>({...v,platform:e.target.value}))}><option value="website">Official website</option><option value="youtube">YouTube</option><option value="spotify">Spotify</option><option value="soundcloud">SoundCloud</option><option value="instagram">Instagram</option><option value="other">Other official profile</option></select></label>
 <label className="field full"><span>Official public HTTPS link</span><input type="url" required maxLength={500} value={verificationForm.officialUrl} placeholder="https://your-official-page.example" onChange={e=>setVerificationForm(v=>({...v,officialUrl:e.target.value}))}/></label>
 <label className="field full"><span>Additional evidence (optional)</span><textarea maxLength={600} value={verificationForm.notes} placeholder="Tell the reviewer where you will put the proof code. Do not share passwords or personal documents." onChange={e=>setVerificationForm(v=>({...v,notes:e.target.value}))}/></label>
 <div className="full verification-terms">After requesting verification, add the generated proof code to your official page. An administrator must independently review ownership.</div>
 <button className="btn-primary" disabled={verifyBusy}>{verifyBusy?"Submitting...":"Request verification"} <ArrowRight size={15}/></button></div></form>}
 </section></div>}
      {page==="Verify artists"&&me?.role==="admin"&&<section className="verification-admin"><div className="section-heading"><div><span className="section-index">PENDING REQUESTS</span><h2>Review official ownership <span className="count-number">{verificationQueue.length}</span></h2></div></div><div className="project-tabs"><button className={verificationQueueStatus==="pending"?"selected":""} onClick={()=>chooseReviewQueue("pending")}>Pending</button><button className={verificationQueueStatus==="approved"?"selected":""} onClick={()=>chooseReviewQueue("approved")}>Approved</button><button className={verificationQueueStatus==="rejected"?"selected":""} onClick={()=>chooseReviewQueue("rejected")}>Rejected</button><button className={verificationQueueStatus==="revoked"?"selected":""} onClick={()=>chooseReviewQueue("revoked")}>Revoked</button></div><p>Only approve when you independently confirm the listed artist controls the official page and the unique code appears there. Do not approve links alone.</p>
 {verificationQueue.length?verificationQueue.map(item=><article className="verify-review" key={item.id}><div className="verify-review-top"><span className="section-index">ARTIST IDENTITY REQUEST</span><span className={"pill status-"+item.status}>{item.status.toUpperCase()}</span></div><h3>{item.artistName}</h3><p>Requested by {item.artist?.displayName} ({item.artist?.email})</p><p>Platform: {item.platform}</p><p><a href={item.officialUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={14}/> Open claimed official page</a></p><div className="verify-proof"><code>{item.proofCode}</code></div>{item.notes&&<p>Artist notes: {item.notes}</p>}
 {item.status==="pending"&&<label className="verify-checkbox"><input type="checkbox" checked={!!reviewConfirmed[item.id]} onChange={e=>setReviewConfirmed(v=>({...v,[item.id]:e.target.checked}))}/> I checked the official account independently and confirmed this proof code is publicly displayed.</label>}
 <label className="field"><span>Review notes. Required for rejection or revocation.</span><textarea maxLength={500} value={reviewNotes[item.id]||""} onChange={e=>setReviewNotes(v=>({...v,[item.id]:e.target.value}))} placeholder="Document ownership confirmation or why the request is rejected."/></label>
 <div className="verify-review-actions">{item.status==="pending"&&<><button className="btn-primary" disabled={!reviewConfirmed[item.id]} onClick={()=>reviewVerification(item,"approve")}>Approve verified artist <BadgeCheck size={16}/></button><button className="btn-outline" disabled={!(reviewNotes[item.id]||"").trim()} onClick={()=>reviewVerification(item,"reject")}>Reject request</button></>}{item.status==="approved"&&<button className="btn-outline" disabled={(reviewNotes[item.id]||"").trim().length<3} onClick={()=>revokeVerification(item)}>Revoke verification</button>}</div></article>):empty(<ShieldCheck size={26}/>,"No "+verificationQueueStatus+" requests.","Requests in this category will appear here.")}
 </section>}
      {page==="Portfolio"&&<div className="portfolio-layout">
 <section className="audio-upload-section"><div className="form-head"><span className="section-index">DAY 09 / AUDIO STUDIO</span><h2>Let them hear your sound.</h2><p>Upload short music or clean vocal excerpts as MP3 or WAV. Maximum five samples, 2 MB each. Only upload audio you own or have permission to share.</p></div>
 <form className="audio-upload-form" onSubmit={submitAudio}>
 <label className="field"><span>Sample title</span><input required minLength={2} maxLength={100} value={audioTitle} onChange={e=>setAudioTitle(e.target.value)} placeholder="e.g. Midnight Hook Demo"/></label>
 <label className="field"><span>Type</span><select value={audioKind} onChange={e=>setAudioKind(e.target.value)}><option value="music">Music / instrumental</option><option value="vocal">Vocal sample</option></select></label>
 <label className="field audio-file-field"><span>Choose MP3 or WAV under 2 MB</span><input id="ml-audio-file" type="file" accept=".mp3,.wav,audio/mpeg,audio/wav,audio/x-wav" required onChange={e=>setAudioFile(e.target.files?.[0]||null)}/></label>
 <button className="btn-primary" type="submit" disabled={audioBusy||myAudio.length>=5||!audioFile}>{audioBusy?"Uploading...":"Upload sample"} <ArrowUpRight size={17}/></button>
 </form>
 <div className="section-heading"><div><span className="section-index">YOUR AUDIO LIBRARY</span><h2>Uploaded sounds <span className="count-number">{myAudio.length} / 5</span></h2></div></div>
 {myAudio.length?<div className="audio-sample-list">{myAudio.map(sample=><div className="audio-sample" key={sample.id}><div className="audio-sample-main"><div className="audio-sample-icon"><AudioLines size={21}/></div><div><strong>{sample.title}</strong><span>{sample.kind==="vocal"?"VOCAL":"MUSIC"} · {(sample.byteSize/1024).toFixed(0)} KB</span></div><div className="audio-sample-actions"><button type="button" className="btn-outline" onClick={()=>previewAudio(sample.id)}>{audioPreview?.id===sample.id?"Close":"Listen"} <Headphones size={15}/></button><button type="button" className="btn-outline" onClick={()=>deleteAudio(sample.id)}><Trash2 size={15}/> Delete</button></div></div>{audioPreview?.id===sample.id&&<audio className="audio-native-player" controls preload="metadata" src={audioPreview.url}>Audio player unavailable.</audio>}</div>)}</div>:<p className="audio-empty">No audio uploaded yet. Add a short excerpt for other musicians to hear.</p>}
 </section>
 <div className="portfolio-intro"><span className="section-index">YOUR SOUND</span><h2>Tracks, demos and credits.</h2><p>Share your work. People listen here or follow the original link.</p></div>
 <div className="form-panel portfolio-form"><div className="form-head"><span className="section-index">{editTrack?"EDIT YOUR SAMPLE":"ADD TO YOUR SHOWCASE"}</span><h2>{editTrack?"Edit a track":"Add a track"}</h2><p>You own the links you share. Spotify, YouTube and SoundCloud offer embedded previews.</p></div>
 <form className="form-grid" onSubmit={addPortfolio}>
 {input("title","Track title","e.g. Midnight Sessions",true)}
 {input("url","Music URL","https://soundcloud.com/artist/song",true)}
 {input("role","Your credit","Producer, Vocalist, Songwriter")}
 <label className="field"><span>Release year (optional)</span><input type="number" min="1900" max={new Date().getFullYear()+1} value={form.releaseYear||""} onChange={e=>set("releaseYear",e.target.value)} placeholder="2026"/></label>
 {input("genres","Genres","Trap, Hip Hop")}
 {input("tags","Creative tags","Dark, Melodic")}
 <label className="field full"><span>Short description</span><textarea maxLength={350} value={form.description||""} onChange={e=>set("description",e.target.value)} placeholder="Your part in this track, collaborators, or the story behind it."/></label>
 <div className="portfolio-actions"><button className="btn-primary" type="submit">{editTrack?"Save changes":"Add sample"} <Plus size={16}/></button>{editTrack&&<button type="button" className="btn-outline" onClick={()=>{setEditTrack(null);setForm({})}}>Cancel</button>}</div>
 </form></div>
 <div className="section-heading"><div><span className="section-index">YOUR CATALOGUE</span><h2>Your work <span className="count-number">{me?.portfolio?.length||0}</span></h2></div></div>
 {(me?.portfolio||[]).length?<div className="portfolio-list">{[...(me.portfolio||[])].sort((a,b)=>Number(!!b.featured)-Number(!!a.featured)).map((track,i)=>{const media=getMedia(track.url);return <article className="portfolio-track" key={track._id}>
 <div className="portfolio-track-row"><div className="portfolio-track-art"><AudioLines size={23}/></div><div className="portfolio-track-body"><div className="track-topline">{track.featured&&<span className="featured-label">FEATURED</span>}<span>{media.provider}</span>{track.releaseYear&&<span>{track.releaseYear}</span>}</div><h3>{track.title}</h3><p>{[track.role,...(track.genres||[]).slice(0,2)].filter(Boolean).join(" · ")||"Independent release"}</p>{track.description&&<p className="track-description">{track.description}</p>}</div></div>
 <div className="portfolio-track-controls">{media.embed&&<button className="btn-outline" type="button" onClick={()=>setPlaying(playing===track._id?null:track._id)}>{playing===track._id?"Close preview":"Preview"} <AudioLines size={15}/></button>}<a href={track.url} target="_blank" rel="noopener noreferrer">Open original <ExternalLink size={15}/></a><button type="button" onClick={()=>featureTrack(track._id)} disabled={!!track.featured} title="Feature this track">{track.featured?"Featured":"Feature"}</button><button type="button" onClick={()=>beginEditTrack(track)}>Edit</button><button type="button" onClick={()=>removePortfolio(track._id)} aria-label={"Remove "+track.title}><Trash2 size={16}/></button></div>
 {playing===track._id&&media.embed&&<div className="player-frame"><iframe src={media.embed} title={"Preview "+track.title} loading="lazy" allow="encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" /></div>}
 </article>})}</div>:empty(<Music2 size={28}/>,"Nothing here yet.","Add your first music sample to start your showcase.")}
 </div>}
 {page==="Invitations"&&<>
 <div className="section-heading"><div><span className="section-index">01 / COLLABORATIONS</span><h2>Invitations and replies</h2></div></div>
 <div className="project-tabs invite-tabs"><button className={inviteTab==="received"?"selected":""} onClick={()=>setInviteTab("received")}>Received ({invites.filter(x=>x.status==="pending").length} pending)</button><button className={inviteTab==="sent"?"selected":""} onClick={()=>setInviteTab("sent")}>Sent ({sentInvites.length})</button></div>
 {inviteTab==="received"?(invites.length?<div className="invitation-list">{invites.map(i=><article key={i._id} className="invite-item"><div className="invite-icon"><Mail size={21}/></div><div className="invite-copy"><span className="section-index">INVITATION / {i.status.toUpperCase()}</span><h3>{i.project?.title||"Collaboration project"}</h3><p>From {i.sender?.displayName||"MusicLink creator"} {i.sender?.profession?" · "+i.sender.profession:""}</p></div>{i.status==="pending"?<div className="invite-actions"><button className="btn-primary" onClick={()=>handleInvitation(i._id,"accepted")}>Accept <CircleCheck size={16}/></button><button className="btn-outline" onClick={()=>handleInvitation(i._id,"declined")}>Decline</button></div>:<span className={"pill invite-status status-"+i.status}>{i.status}</span>}</article>)}</div>:empty(<Mail size={28}/>,"Your inbox is clear.","New invitations will appear here.")):(sentInvites.length?<div className="invitation-list">{sentInvites.map(i=><article key={i._id} className="invite-item"><div className="invite-icon"><ArrowUpRight size={22}/></div><div className="invite-copy"><span className="section-index">SENT INVITATION</span><h3>{i.project?.title||"Collaboration project"}</h3><p>To {i.receiver?.displayName||"MusicLink creator"} {i.receiver?.profession?" · "+i.receiver.profession:""}</p></div><span className={"pill invite-status status-"+i.status}>{i.status}</span></article>)}</div>:empty(<Mail size={28}/>,"No invitations sent.","Shortlist recommended creators and send an invitation from a project."))}
 </>}
 {page==="Project details"&&project&&<><button className="back-link" onClick={()=>go("Projects")}><ArrowLeft size={17}/> Back to projects</button><div className="project-detail"><div className="project-detail-art"><img src="https://images.unsplash.com/photo-1634286051376-940ff8525141?auto=format&fit=crop&w=1300&q=80" alt="Music studio equipment"/></div><div className="project-detail-content"><span className="section-index">PROJECT BRIEF / {project.status?.toUpperCase()}</span><h2>{project.title}</h2><p>{project.description||"This creator is looking for the right music collaborators."}</p><div className="detail-chips">{badge([...(project.genres||[]),...(project.requiredRoles||[]),...(project.requiredSkills||[])])}</div>{project.targetDate&&<p><CalendarDays size={14} style={{verticalAlign:"middle"}}/> Target date: {new Date(project.targetDate).toLocaleDateString()}</p>}{showOwner(project)?<div className="project-owner-actions"><button className="btn-primary" onClick={()=>loadRecommendations()}>Find collaborators <ArrowRight size={16}/></button><button className="btn-outline" onClick={()=>beginEditProject(project)}>Edit project</button><button className="btn-outline" onClick={()=>updateProjectStatus(project.status==="open"?"closed":"open")}>{project.status==="open"?"Close applications":"Reopen project"}</button></div>:project.status==="open"?<div className="application-form"><label className="field"><span>Message to the project owner</span><textarea maxLength={600} value={applicationNote} onChange={e=>setApplicationNote(e.target.value)} placeholder="Why would you like to work on this project?"/></label><button className="btn-primary" onClick={applyToProject}>Apply to collaborate <ArrowRight size={16}/></button></div>:<p className="closed-message">This project is closed to new applications.</p>}</div></div>
      {showOwner(project)&&<><section className="shortlist-section"><div className="section-heading"><div><span className="section-index">01 / YOUR SELECTION</span><h2>Shortlisted collaborators <span className="count-number">{shortlistEntries.length}</span></h2></div></div>{shortlistEntries.length?<div className="shortlist-list">{shortlistEntries.map(person=><article key={person.id} className="shortlist-person"><div className="small-avatar" style={{background:avatarColor(person.displayName)}}>{person.avatarUrl?<img src={person.avatarUrl} alt="" loading="lazy"/>:person.displayName?.charAt(0)}</div><div className="shortlist-info"><strong>{person.displayName}</strong><span>{person.profession||"Independent creator"}</span></div><span className={"pill invite-status status-"+person.invitationStatus}>{person.invitationStatus==="not_sent"?"NOT INVITED":person.invitationStatus.toUpperCase()}</span><div className="shortlist-actions">{person.invitationStatus==="not_sent"&&<><button type="button" className="btn-primary" onClick={()=>invite(person.id)}>Invite <ArrowRight size={14}/></button><button type="button" className="btn-outline" onClick={()=>removeShortlist(person.id)}>Remove</button></>}{person.invitationStatus==="declined"&&<button type="button" className="btn-outline" onClick={()=>removeShortlist(person.id)}>Remove</button>}</div></article>)}</div>:<p className="muted">Shortlist recommended musicians to contact them about this project.</p>}</section><div className="section-heading"><div><span className="section-index">02 / MATCHING</span><h2>Find your fit.</h2></div></div><div className="tabs"><button className={mode==="blind"?"selected":""} onClick={()=>loadRecommendations("blind")}>Blind review</button><button className={mode==="visible"?"selected":""} onClick={()=>loadRecommendations("visible")}>Visible review</button></div>{recs&&<><div className="rec-overview"><div><span className="section-index">MATCHING MODEL</span><h3>{recs.method||"MCCA-RCC"}</h3><p>Research prototype, not a trained AI model. Scores estimate fit based on profile details and preferences.</p></div><div className="rec-overview-stat"><strong>{recs.summary?.candidateCount??recs.ranked.length}</strong><span>CREATORS RANKED</span></div><div className="rec-overview-stat"><strong>{recs.summary?.topMatches??0}</strong><span>70+ SCORE</span></div></div>
 <div className="rec-method"><span>Project fit: 20% genre, 25% skills, 25% creative direction, 20% portfolio, 10% availability.</span><span>Final score balances project fit and creator preferences. No score guarantees a successful collaboration.</span></div>
 {recs.ranked.length?<div className="cards creator-match-grid">{recs.ranked.map((r,index)=><article className="match-card" key={r.matchId}><div className="match-top"><div className="match-score">{Number(r.score).toFixed(1)} <span>/ 100</span></div><span className="section-index">RANK {index+1}</span></div><h3>{r.displayName||r.anonymousRef}</h3>{r.profession&&<p className="rec-profession">{r.profession}</p>}<p>{r.explanation}</p><div className="factor-list">{Object.entries(r.factors).map(([key,value])=><div className="factor-row" key={key}><span>{({genre:"Genre",skills:"Skills / role",creative:"Creative direction",portfolio:"Portfolio",availability:"Availability"})[key]||key}</span><div className="factor-bar"><div style={{width:Math.max(0,Math.min(100,value))+"%"}}/></div><strong>{Math.round(value)}%</strong></div>)}</div>
 <div className="match-data">PROJECT FIT {r.forward} / CREATOR FIT {r.reverse}</div>
 <p className="rec-evidence">Evidence: {r.evidence?.specifiedRequirements??0} of 4 project criteria specified. {r.evidence?.hasPortfolio?"Portfolio provided.":"No portfolio shared."}</p>
 <div className="match-actions">{!r.shortlisted?<button className="btn-primary" onClick={()=>shortlist(r.matchId)}>Add to shortlist <Plus size={15}/></button>:<><span className="availability available">SHORTLISTED</span>{shortlistEntries.find(x=>x.id===r.id)?.invitationStatus&&shortlistEntries.find(x=>x.id===r.id)?.invitationStatus!=="not_sent"?<span className="pill invite-status">{shortlistEntries.find(x=>x.id===r.id).invitationStatus}</span>:<button className="btn-outline" onClick={()=>invite(r.id||r.matchId)}>Send invitation <ArrowRight size={15}/></button>}</>}</div></article>)}</div>:empty(<UsersRound size={28}/>,"No creators available.","New creator profiles will appear when people join.")}</>}{apps.length>0&&<><div className="section-heading"><div><span className="section-index">03 / APPLICATIONS</span><h2>Interested creators</h2></div></div><div className="invitation-list">{apps.map(a=><article className="invite-item" key={a._id}><div className="small-avatar" style={{background:avatarColor(a.creator?.displayName)}}>{a.creator?.displayName?.charAt(0)}</div><div><h3>{a.creator?.displayName}</h3><p>{a.creator?.profession} / {a.status}</p></div>{a.status==="pending"&&<div className="invite-actions"><button className="btn-primary" onClick={()=>updateApplication(a._id,"accepted")}>Accept</button><button className="btn-outline" onClick={()=>updateApplication(a._id,"rejected")}>Decline</button></div>}</article>)}</div></>}</>}
      </>}
      <footer className="site-footer"><span>{brand} © 2026</span><span>MADE FOR THE PEOPLE BEHIND THE MUSIC</span><span>INDEPENDENT BY DESIGN</span></footer>
     </div>
   </main>
 </div>;

}
function split(value){return Array.isArray(value)?value:String(value||"").split(",").map(x=>x.trim()).filter(Boolean)}
createRoot(document.getElementById("root")).render(<App/>);
