/**
 * MusicLink Day 11: exploratory monophonic vocal pitch analysis.
 * Uses normalized autocorrelation. This DOES NOT identify vocal identity,
 * gender, talent, medical traits, or singing skill.
 */
import {toMono} from "./musicAnalysis.js";
export const VOCAL_VERSION="musiclink-vocal-dsp-v1";
const clamp=x=>Math.max(0,Math.min(1,x));
const round=(x,n=2)=>Number(x.toFixed(n));
const noteFromHz=hz=>{
 if(!(hz>0))return null;
 const midi=Math.round(69+12*Math.log2(hz/440));
 const notes=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
 return notes[(midi%12+12)%12]+(Math.floor(midi/12)-1);
};
const percentile=(sorted,p)=>sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))];
export function pitchForFrame(samples,sampleRate,start,size=2048){
 let mean=0,energy=0;
 for(let i=0;i<size;i++)mean+=samples[start+i]||0;
 mean/=size;
 for(let i=0;i<size;i++){const x=(samples[start+i]||0)-mean;energy+=x*x;}
 if(Math.sqrt(energy/size)<.012)return null;
 // Evaluate likely fundamental frequencies between 75 and 900 Hz.
 const minLag=Math.ceil(sampleRate/900),maxLag=Math.floor(sampleRate/75);
 let bestLag=0,bestScore=-1,secondScore=-1;
 for(let lag=minLag;lag<=maxLag;lag++){
  let dot=0,left=0,right=0;
  const usable=size-lag;
  for(let i=0;i<usable;i+=2){
   const a=(samples[start+i]||0)-mean,b=(samples[start+i+lag]||0)-mean;
   dot+=a*b;left+=a*a;right+=b*b;
  }
  const score=dot/Math.sqrt(Math.max(1e-12,left*right));
  if(score>bestScore){secondScore=bestScore;bestScore=score;bestLag=lag}
  else if(score>secondScore)secondScore=score;
 }
 if(bestScore<.72||!bestLag)return null;
 // An octave ambiguity remains possible for harmonic signals.
 const confidence=clamp((bestScore-.67)/.33);
 return {hz:sampleRate/bestLag,confidence};
}
export function analyzeVocalPCM(samples,sampleRate=11025){
 if(!samples||samples.length<sampleRate*.7)throw Error("A vocal recording of at least 0.7 seconds is needed.");
 const size=2048,hop=1024;
 const frames=[];
 for(let start=0;start+size<=samples.length;start+=hop){
  const v=pitchForFrame(samples,sampleRate,start,size);
  if(v)frames.push(v);
 }
 const frameCount=Math.floor(Math.max(0,samples.length-size)/hop)+1;
 const voicedFraction=round(frames.length/Math.max(1,frameCount),3);
 if(frames.length<4||voicedFraction<.08)return {
  version:VOCAL_VERSION,duration:round(samples.length/sampleRate),
  lowHz:null,highHz:null,medianHz:null,lowNote:null,highNote:null,
  voicedFraction,stability:null,confidence:0,characteristic:"Insufficient voiced audio"
 };
 const pitches=frames.map(f=>f.hz).sort((a,b)=>a-b);
 const low=percentile(pitches,.1),high=percentile(pitches,.9),median=percentile(pitches,.5);
 // "Stability" measures pitch variation in this excerpt, not singing quality:
 // deliberate vibrato or melodic motion can produce large variations.
 const semitones=frames.map(f=>12*Math.log2(f.hz/median));
 const mean=semitones.reduce((a,b)=>a+b,0)/semitones.length;
 const sd=Math.sqrt(semitones.reduce((a,v)=>a+(v-mean)**2,0)/semitones.length);
 const stability=round(clamp(1-sd/6),3);
 const periodicity=frames.reduce((a,b)=>a+b.confidence,0)/frames.length;
 const confidence=round(clamp(periodicity*.55+Math.min(1,voicedFraction/.65)*.45),3);
 const characteristic=voicedFraction<.27?"Sparse voiced passages":sd<1.1?"Mostly steady pitch":sd<3?"Moderately varied pitch":"Wide pitch movement";
 return {
  version:VOCAL_VERSION,duration:round(samples.length/sampleRate),
  lowHz:round(low,1),highHz:round(high,1),medianHz:round(median,1),
  lowNote:noteFromHz(low),highNote:noteFromHz(high),
  voicedFraction,stability,confidence,characteristic
 };
}
export async function analyzeVocalFile(file){
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;
 if(!AudioContextClass)throw Error("Vocal analysis requires Web Audio support.");
 const ctx=new AudioContextClass();
 try{
  const decoded=await ctx.decodeAudioData(await file.arrayBuffer());
  if(decoded.duration<.7)throw Error("Recording is too short.");
  return analyzeVocalPCM(toMono(decoded,11025,45),11025);
 }finally{await ctx.close()}
}
