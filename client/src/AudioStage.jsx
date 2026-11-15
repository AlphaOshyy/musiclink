import React,{useEffect,useRef,useState} from "react";
import {AudioLines,Headphones,Layers3,Volume2} from "lucide-react";
import {createListeningRoom} from "./listeningRoom.js";

function supportsMotion(){
 if(typeof window==="undefined")return false;
 return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
/**
 * The Three.js scene is optional and loaded only after user interaction.
 * The native audio element continues working when WebGL is not available.
 */
export default function AudioStage({src,title}){
 const audio=useRef(null),mount=useRef(null);
 const [enabled,setEnabled]=useState(false);
 const [status,setStatus]=useState("idle");
 const [playing,setPlaying]=useState(false);
 const [reducedMotion,setReducedMotion]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia("(prefers-reduced-motion: reduce)");
  const update=()=>{setReducedMotion(media.matches);if(media.matches)setEnabled(false)};
  update();media.addEventListener?.("change",update);
  return()=>media.removeEventListener?.("change",update);
 },[]);
 useEffect(()=>{
  if(!enabled||!audio.current||!mount.current)return;
  let cancelled=false,scene;
  setStatus("loading");
  createListeningRoom({audio:audio.current,mount:mount.current}).then(controller=>{
   if(cancelled){controller.destroy();return}
   scene=controller;setStatus("ready");
  }).catch(()=>{
   if(!cancelled){setStatus("error");setEnabled(false)}
  });
  return()=>{cancelled=true;scene?.destroy()};
 },[enabled,src]);
 const toggle=()=>{if(!supportsMotion()){setReducedMotion(true);return}setEnabled(v=>!v)};
 return <section className="ml-listening-room" aria-label={"Listen to "+title}>
  <div className="ml-listening-room-head"><div className="ml-listening-room-identity"><AudioLines size={17}/><span>PLAYBACK / {title}</span></div><button type="button" className={"ml-room-toggle"+(enabled?" is-active":"")} disabled={reducedMotion} onClick={toggle} aria-pressed={enabled}><Layers3 size={15}/>{enabled?"Close 3D room":"Open 3D room"}</button></div>
  {enabled&&<div className="ml-room-canvas" ref={mount} role="img" aria-label="Three-dimensional audio spectrum that reacts to playback">
   <div className="ml-room-frame-label"><span>LIVE FREQUENCY RESPONSE</span><span>THREE.JS / EXPERIMENTAL</span></div>
   {status==="loading"&&<span className="ml-room-loading">Preparing the listening room...</span>}
  </div>}
  <div className="ml-audio-control-row"><Headphones size={16}/><audio ref={audio} className="audio-native-player" controls preload="metadata" src={src} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)}>Your browser does not support audio playback.</audio><span className={"ml-audio-signal"+(playing?" is-playing":"")} title={playing?"Playing":"Paused"}><Volume2 size={15}/></span></div>
  {reducedMotion&&<p className="ml-room-note">3D motion is disabled by your device's reduced-motion preference.</p>}
  {status==="error"&&<p className="ml-room-note">3D rendering is unavailable on this device. Audio playback remains available.</p>}
 </section>
}
