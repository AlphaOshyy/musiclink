/**
 * MusicLink / Listening Room, Day 13
 * User-initiated Three.js spectrum stage, rendered only for an active preview.
 * The scene is a representation of actual frequency-band magnitudes measured
 * from the same native audio element used for accessible playback.
 */
import {bandLevels} from "./listeningRoomMath.js";

export async function createListeningRoom({audio,mount}){
 const THREE=await import("three");
 const canvas=document.createElement("canvas");
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"low-power"});
 if(!renderer.capabilities.isWebGL2){renderer.dispose();throw Error("WebGL 2 is required");}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.setClearColor(0x10101a,1);
 mount.appendChild(canvas);
 let audioContext=null,source=null,analyser=null;
 try{
  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context)throw Error("Web Audio API is unavailable.");
  audioContext=new Context();
  source=audioContext.createMediaElementSource(audio);
  analyser=audioContext.createAnalyser();
  analyser.fftSize=1024;
  analyser.smoothingTimeConstant=.8;
  source.connect(analyser);
  analyser.connect(audioContext.destination);
 }catch(e){
  renderer.dispose();canvas.remove();
  await audioContext?.close().catch(()=>{});
  throw e;
 }
 const scene=new THREE.Scene();
 scene.fog=new THREE.FogExp2(0x10101a,.045);
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);
 camera.position.set(0,7.1,20);
 camera.lookAt(0,2.1,0);
 const ambient=new THREE.AmbientLight(0xc8c4f2,1.5);
 scene.add(ambient);
 const violet=new THREE.PointLight(0xaf73ff,30,22),blue=new THREE.PointLight(0x4fc9ff,23,18);
 violet.position.set(-5,6,4);blue.position.set(5,4,-2);scene.add(violet,blue);
 const group=new THREE.Group();scene.add(group);
 const geometry=new THREE.BoxGeometry(.17,1,.24);
 const columns=Array.from({length:48},(_,i)=>{
  const mat=new THREE.MeshStandardMaterial({
   color:new THREE.Color().setHSL(.71-(i/47)*.18,.65,.36),
   emissive:new THREE.Color().setHSL(.72-(i/47)*.2,.68,.17),
   emissiveIntensity:.45,metalness:.27,roughness:.34
  });
  const bar=new THREE.Mesh(geometry,mat);
  bar.position.set((i-23.5)*.29,.32,Math.sin(i*.16)*.95);
  group.add(bar);return bar;
 });
 const grid=new THREE.GridHelper(24,24,0x545073,0x252438);
 grid.position.y=-.1;
 scene.add(grid);
 const levelsData=new Uint8Array(analyser.frequencyBinCount);
 const clock=new THREE.Clock();
 let raf=0,disposed=false,last=0,pointerX=0,pointerY=0;
 const updateSize=()=>{
  if(disposed)return;
  const w=Math.max(1,mount.clientWidth),h=Math.max(1,mount.clientHeight);
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 };
 const ro=new ResizeObserver(updateSize);
 ro.observe(mount);updateSize();
 const move=e=>{
  const r=mount.getBoundingClientRect();
  pointerX=((e.clientX-r.left)/Math.max(1,r.width)-.5);
  pointerY=((e.clientY-r.top)/Math.max(1,r.height)-.5);
 };
 mount.addEventListener("pointermove",move,{passive:true});
 let visible=true;
 const visibility=()=>{visible=document.visibilityState==="visible"};
 document.addEventListener("visibilitychange",visibility);
 const resume=()=>{audioContext?.resume().catch(()=>{})};
 audio.addEventListener("play",resume);
 if(!audio.paused)resume();
 const frame=(time)=>{
  if(disposed)return;
  raf=requestAnimationFrame(frame);
  if(!visible||time-last<28)return;
  last=time;
  const active=!audio.paused&&!audio.ended&&audio.readyState>=2;
  if(active)analyser.getByteFrequencyData(levelsData);
  const values=active?bandLevels(levelsData,48):null;
  columns.forEach((mesh,i)=>{
   const level=values?values[i]:.05;
   const next=.22+Math.pow(level,1.16)*5.5;
   mesh.scale.y+=(next-mesh.scale.y)*.14;
   mesh.position.y=mesh.scale.y*.5;
   mesh.material.emissiveIntensity=.22+level*.95;
  });
  camera.position.x+=(pointerX*1.4-camera.position.x)*.05;
  camera.position.y+=(7.1-pointerY*.55-camera.position.y)*.05;
  camera.lookAt(0,2.1,0);
  renderer.render(scene,camera);
 };
 raf=requestAnimationFrame(frame);
 return {destroy(){
  if(disposed)return;disposed=true;cancelAnimationFrame(raf);
  ro.disconnect();mount.removeEventListener("pointermove",move);
  document.removeEventListener("visibilitychange",visibility);
  audio.removeEventListener("play",resume);
  group.remove(...columns);
  columns.forEach(bar=>bar.material.dispose());
  geometry.dispose();grid.geometry.dispose();grid.material.dispose();
  renderer.dispose();canvas.remove();
  // Disconnect to avoid an obsolete audio graph continuing to process samples.
  source?.disconnect();analyser?.disconnect();
  audioContext?.close().catch(()=>{});
 }};
}
