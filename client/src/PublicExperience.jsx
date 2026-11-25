import React,{useEffect,useState} from "react";
import {ArrowRight,ArrowUpRight,ArrowLeft,AudioLines,BadgeCheck,Check,Copy,Disc3,ExternalLink,Headphones,Instagram,LockKeyhole,Music2,Play,Radio,UsersRound} from "lucide-react";
import {getMedia} from "./media.js";
import "./publicExperience.css";
const API=import.meta.env.VITE_API_URL||"http://localhost:4000/api";
const HERO="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1900&q=85";
const STUDIO="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1100&q=82";
const portrait="https://images.unsplash.com/photo-1535732850099-99177944f4c5?auto=format&fit=crop&w=1200&q=82";
const artistFromLocation=()=>window.location.pathname.match(/^\/artist\/([a-f0-9]{24})\/?$/i)?.[1]||null;
const shellBrand=<span className="mlp-brand"><img src="/musiclink-mark.webp" width="35" height="35" alt=""/><span>Music<span>Link</span></span></span>;
const initials=name=>(name||"M").trim().slice(0,2).toUpperCase();
function ArtistTile({artist,onOpen,index}){
 return <button type="button" className="mlp-artist-card" onClick={()=>onOpen(artist.id)}>
  <div className="mlp-artist-card-visual">
   {artist.avatarUrl?<img loading="lazy" src={artist.avatarUrl} alt=""/>:<span className="mlp-artist-placeholder">{initials(artist.displayName)}</span>}
   <span className="mlp-card-index">ARTIST {String(index+1).padStart(2,"0")}</span>
   <span className="mlp-card-arrow"><ArrowUpRight size={20}/></span>
  </div>
  <div className="mlp-artist-card-info"><div><h3>{artist.displayName} {artist.verified&&<BadgeCheck size={16} aria-label="Verified"/>}</h3><span>{artist.profession}</span></div><span className="mlp-artist-availability">{artist.available?"OPEN TO COLLAB":"PROFILE"}</span></div>
  <div className="mlp-mini-genres">{(artist.genres||[]).slice(0,3).map((g,i)=><span key={i}>{g}</span>)}</div>
 </button>;
}
export default function PublicExperience({onSignIn,onJoin,onDashboard,loggedIn=false}){
 const [artistId,setArtistId]=useState(artistFromLocation);
 const [featured,setFeatured]=useState([]);
 const [loadingList,setLoadingList]=useState(true);
 const [artist,setArtist]=useState(null);
 const [loadingArtist,setLoadingArtist]=useState(false);
 const [artistError,setArtistError]=useState("");
 const [expandedTrack,setExpandedTrack]=useState(null);
 const [copied,setCopied]=useState(false);
 useEffect(()=>{
  const controller=new AbortController();
  fetch(API+"/public/creators?limit=6",{signal:controller.signal})
   .then(r=>r.ok?r.json():Promise.reject(new Error("Artist discovery unavailable")))
   .then(data=>setFeatured(Array.isArray(data)?data:[]))
   .catch(()=>setFeatured([]))
   .finally(()=>{if(!controller.signal.aborted)setLoadingList(false)});
  return()=>controller.abort();
 },[]);
 useEffect(()=>{
  const onPop=()=>{setArtistId(artistFromLocation());setExpandedTrack(null)};
  window.addEventListener("popstate",onPop);
  return()=>window.removeEventListener("popstate",onPop);
 },[]);
 useEffect(()=>{
  if(!artistId){setArtist(null);document.title="MusicLink | Music is made together";return}
  const controller=new AbortController();
  setArtist(null);setArtistError("");setLoadingArtist(true);
  fetch(API+"/public/creators/"+artistId,{signal:controller.signal})
   .then(r=>r.ok?r.json():Promise.reject(new Error("This artist has not made their page public.")))
   .then(value=>{setArtist(value);document.title=value.displayName+" | MusicLink"})
   .catch(e=>{if(!controller.signal.aborted)setArtistError(e.message)})
   .finally(()=>{if(!controller.signal.aborted)setLoadingArtist(false)});
  return()=>controller.abort();
 },[artistId]);
 const home=()=>{window.history.pushState({},"","/");setArtistId(null);setExpandedTrack(null);window.scrollTo({top:0,behavior:"smooth"})};
 const openArtist=id=>{if(!/^[a-f0-9]{24}$/i.test(String(id)))return;window.history.pushState({},"","/artist/"+id);setArtistId(id);setExpandedTrack(null);window.scrollTo({top:0,behavior:"smooth"})};
 const copyLink=async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopied(true)}catch{setCopied(false)}};
 return <div className="ml-public">
  <header className="mlp-header"><button type="button" className="mlp-brand-button" onClick={home} aria-label="MusicLink home">{shellBrand}</button>
   <nav aria-label="Public navigation"><button type="button" onClick={home}>Home</button><button type="button" onClick={()=>{home();requestAnimationFrame(()=>document.getElementById("mlp-how")?.scrollIntoView({behavior:"smooth"}))}}>How it works</button><button type="button" onClick={()=>{home();requestAnimationFrame(()=>document.getElementById("mlp-artists")?.scrollIntoView({behavior:"smooth"}))}}>Artists</button></nav>
   <div className="mlp-nav-actions">{loggedIn?<button type="button" className="mlp-nav-outline" onClick={onDashboard}>My workspace <ArrowUpRight size={16}/></button>:<><button type="button" className="mlp-signin" onClick={onSignIn}>Log in</button><button type="button" className="mlp-nav-outline" onClick={onJoin}>Join MusicLink <ArrowUpRight size={16}/></button></>}</div>
  </header>
  {artistId? <main className="mlp-profile-main">
   <button type="button" className="mlp-back" onClick={home}><ArrowLeft size={17}/> Explore MusicLink</button>
   {loadingArtist?<div className="mlp-profile-loading">Loading artist profile...</div>:artistError||!artist?<div className="mlp-profile-error"><span>PROFILE UNAVAILABLE</span><h1>This artist page isn't public.</h1><p>The artist might have turned off public sharing or the link is invalid.</p><button type="button" className="mlp-button-primary" onClick={home}>Return to MusicLink <ArrowRight size={18}/></button></div>:<>
    <section className="mlp-profile-hero">
     <div className="mlp-profile-photo">{artist.avatarUrl?<img src={artist.avatarUrl} alt={artist.displayName+" profile photo"}/>:<span>{initials(artist.displayName)}</span>}<span className="mlp-photo-caption">ARTIST PROFILE / MUSICLINK</span></div>
     <div className="mlp-profile-intro">
      <div className="mlp-overline"><span>THE ARTISTS / 001</span><span className="mlp-line"/></div>
      <p className="mlp-profile-role">{artist.profession||"Independent artist"} <span className="mlp-dot"/> {artist.available?"Open to collaboration":"Not currently available"}</p>
      <h1>{artist.displayName}<span className="mlp-profile-dot">.</span></h1>
      {artist.verified&&<span className="mlp-verified"><BadgeCheck size={16}/> MusicLink verified</span>}
      <p className="mlp-profile-bio">{artist.bio||"Independent music creator on MusicLink."}</p>
      <div className="mlp-profile-cta"><button type="button" className="mlp-button-primary" onClick={loggedIn?onDashboard:onJoin}>Connect on MusicLink <ArrowUpRight size={17}/></button><button type="button" className="mlp-button-ghost" onClick={copyLink}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?"Copied":"Copy profile link"}</button></div>
      <div className="mlp-profile-footer-metrics"><div><strong>{(artist.portfolio||[]).length}</strong><span>SELECTED WORKS</span></div><div><strong>{(artist.genres||[]).length}</strong><span>GENRES</span></div><div><strong>{artist.available?"OPEN":"OFF"}</strong><span>COLLAB STATUS</span></div></div>
     </div>
    </section>
    <section className="mlp-profile-lower">
     <div className="mlp-profile-sidebar"><span className="mlp-section-index">01 / CREATIVE IDENTITY</span><h2>The sound<br/>behind the name.</h2><div className="mlp-profile-taxonomy"><span>GENRES</span><div>{(artist.genres||[]).length?artist.genres.map((v,i)=><b key={i}>{v}</b>):<em>Not specified</em>}</div></div><div className="mlp-profile-taxonomy"><span>SKILLS</span><div>{(artist.skills||[]).length?artist.skills.map((v,i)=><b key={i}>{v}</b>):<em>Not specified</em>}</div></div><div className="mlp-profile-taxonomy"><span>CREATIVE DIRECTION</span><div>{(artist.creativeTags||[]).length?artist.creativeTags.map((v,i)=><b key={i}>{v}</b>):<em>Not specified</em>}</div></div></div>
     <div className="mlp-profile-tracks"><div className="mlp-section-title"><span className="mlp-section-index">02 / DISCOGRAPHY & WORK</span><h2>Selected work.</h2></div>
      {(artist.portfolio||[]).length?artist.portfolio.map((track,i)=>{const media=getMedia(track.url);return <article className="mlp-track" key={i}><div className="mlp-track-number">{String(i+1).padStart(2,"0")}</div><div className="mlp-track-content"><h3>{track.title}</h3><p>{track.description||track.role||"Music portfolio selection"}</p><span>{track.releaseYear||"MUSICLINK PORTFOLIO"} {track.role?" / "+track.role:""}</span>{expandedTrack===i&&media.embed&&<div className="mlp-embed"><iframe title={"Preview "+track.title} src={media.embed} allow="encrypted-media; fullscreen; picture-in-picture" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"/></div>}</div><div className="mlp-track-actions">{media.embed&&<button type="button" onClick={()=>setExpandedTrack(expandedTrack===i?null:i)} aria-label={"Preview "+track.title}><Play size={16}/><span>{expandedTrack===i?"Close":"Preview"}</span></button>}<a href={track.url} target="_blank" rel="noopener noreferrer" aria-label={"Open "+track.title}><ExternalLink size={16}/></a></div></article>}):<div className="mlp-no-tracks"><Disc3 size={28}/><p>No public portfolio links yet.</p></div>}
      <p className="mlp-privacy-note"><LockKeyhole size={15}/> Uploaded audio files and private collaborations stay inside the signed-in workspace.</p>
     </div>
    </section>
   </>}
  </main>:<main>
   <section className="mlp-hero"><div className="mlp-hero-copy"><div className="mlp-hero-eyebrow"><span className="mlp-signal"/> INDEPENDENT MUSIC. REAL COLLABORATION.</div><h1>MAKE<br/><span>MORE</span><br/>TOGETHER<span className="mlp-purple-stop">.</span></h1><p>Find the right artists, producers and engineers. Hear their work. Build something worth releasing.</p><div className="mlp-hero-buttons"><button type="button" className="mlp-button-primary" onClick={loggedIn?onDashboard:onJoin}>{loggedIn?"Go to workspace":"Find your people"} <ArrowUpRight size={20}/></button><button type="button" className="mlp-button-ghost" onClick={()=>document.getElementById("mlp-how")?.scrollIntoView({behavior:"smooth"})}>See how it works <ArrowRight size={17}/></button></div><div className="mlp-hero-foot"><span>BUILT FOR THE PEOPLE BEHIND THE MUSIC</span><span>01 / 03</span></div></div><div className="mlp-hero-visual"><img src={HERO} alt="Music production studio" fetchPriority="high"/><div className="mlp-hero-visual-label"><AudioLines size={18}/> YOUR NEXT SESSION STARTS HERE</div><div className="mlp-hero-side-word">INDEPENDENT / MUSIC / COMMUNITY</div></div></section>
   <div className="mlp-ticker" aria-hidden="true"><div className="mlp-ticker-inner"><span>THE RIGHT PEOPLE. THE RIGHT SOUND. <b>✳</b> INDEPENDENT BY DESIGN. <b>✳</b> MUSIC IS MADE TOGETHER. <b>✳</b> </span><span>THE RIGHT PEOPLE. THE RIGHT SOUND. <b>✳</b> INDEPENDENT BY DESIGN. <b>✳</b> MUSIC IS MADE TOGETHER. <b>✳</b> </span></div></div>
   <section className="mlp-steps" id="mlp-how"><div className="mlp-section-heading"><span className="mlp-section-index">01 / THE WAY WE WORK</span><h2>Less searching.<br/><em>More creating.</em></h2><p>MusicLink puts discovery, portfolio listening and collaboration in one place.</p></div><div className="mlp-step-grid">{[
     {n:"01",title:"Find your sound",body:"Explore artists by genre, skills and creative direction, with real portfolios instead of popularity alone.",Icon:Headphones},
     {n:"02",title:"See the connection",body:"Read explainable compatibility suggestions. Optional audio signals support, rather than replace, your own judgment.",Icon:Radio},
     {n:"03",title:"Make it together",body:"Create a project, shortlist collaborators and send invitations when the fit feels right.",Icon:UsersRound}
   ].map(({n,title,body,Icon})=><div className="mlp-step" key={n}><span className="mlp-step-no">{n} /</span><Icon size={25} strokeWidth={1.4}/><h3>{title}</h3><p>{body}</p></div>)}</div></section>
   <section className="mlp-feature-story"><div className="mlp-story-photo"><img src={STUDIO} loading="lazy" alt="A vocalist performing into a microphone"/><span>LESS SCROLLING / MORE SESSIONS</span></div><div className="mlp-story-copy"><span className="mlp-section-index">02 / MORE THAN A DIRECTORY</span><h2>Good ideas<br/>need <em>good people.</em></h2><p>Bring your music into the conversation. Share selected tracks, showcase your skills and find collaborators who understand the direction you're going.</p><div className="mlp-story-points"><span><Check size={16}/> Artist portfolios</span><span><Check size={16}/> Blind-review recommendations</span><span><Check size={16}/> Private invitations</span><span><Check size={16}/> Real music previews</span></div><button type="button" onClick={loggedIn?onDashboard:onJoin} className="mlp-button-ghost">Explore the platform <ArrowUpRight size={18}/></button></div></section>
   <section className="mlp-artists" id="mlp-artists"><div className="mlp-section-heading mlp-artists-heading"><div><span className="mlp-section-index">03 / THE PEOPLE</span><h2>Artists in the<br/><em>making.</em></h2></div><p>Meet the creators who have chosen to share their MusicLink profiles publicly.</p></div>
    {loadingList?<div className="mlp-artists-empty"><Disc3 size={24}/><p>Loading the artist directory...</p></div>:featured.length?<div className="mlp-artist-grid">{featured.map((a,i)=><ArtistTile key={a.id} artist={a} index={i} onOpen={openArtist}/>)}</div>:<div className="mlp-artists-empty"><Music2 size={28}/><div><h3>The stage is opening.</h3><p>Artists will appear here when they enable public profile sharing. Be among the first to put your sound forward.</p></div><button type="button" onClick={loggedIn?onDashboard:onJoin}>Create your artist profile <ArrowUpRight size={17}/></button></div>}
   </section>
   <section className="mlp-bottom-cta"><img src={portrait} loading="lazy" alt="Artists working together in a recording environment"/><div><span className="mlp-section-index">YOUR NEXT RECORD IS NOT MADE ALONE</span><h2>Make the<br/><em>connection.</em></h2><button type="button" className="mlp-button-primary" onClick={loggedIn?onDashboard:onJoin}>{loggedIn?"Open workspace":"Join MusicLink"} <ArrowUpRight size={18}/></button></div></section>
  </main>}
  <footer className="mlp-footer">{shellBrand}<span>INDEPENDENT PEOPLE. ORIGINAL MUSIC.</span><span>© MUSICLINK 2026</span></footer>
 </div>;
}
