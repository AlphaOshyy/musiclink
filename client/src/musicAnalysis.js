/**
 * MusicLink Day 10: dependency-free exploratory DSP over decoded PCM.
 *
 * No model is trained here. Key and tempo are estimates; styles and moods are
 * transparent heuristics, NOT recognized genres or objective emotions.
 * Use for short excerpts and report low confidence for unstable estimates.
 */
export const ANALYSIS_VERSION="musiclink-browser-dsp-v1";
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
const PC=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const MAJOR=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
const MINOR=[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
const round=(v,n=3)=>Number(v.toFixed(n));
export function toMono(audioBuffer,targetRate=11025,maxSeconds=160){
 const channels=audioBuffer.numberOfChannels;
 if(!channels||!audioBuffer.length||!audioBuffer.sampleRate)throw Error("Audio could not be decoded.");
 const stride=audioBuffer.sampleRate/targetRate;
 const length=Math.min(Math.ceil(audioBuffer.length/stride),Math.ceil(maxSeconds*targetRate));
 const result=new Float32Array(length);
 const data=Array.from({length:Math.min(channels,2)},(_,i)=>audioBuffer.getChannelData(i));
 for(let i=0;i<length;i++){
  const pos=i*stride,start=Math.floor(pos),fraction=pos-start;
  let sample=0;
  for(const c of data)sample+=(c[start]||0)*(1-fraction)+(c[Math.min(start+1,c.length-1)]||0)*fraction;
  result[i]=sample/data.length;
 }
 return result;
}
export function estimateTempo(onsets,frameDuration){
 const len=onsets.length;
 if(len<32)return {bpm:null,confidence:0};
 let sum=0;
 for(let i=0;i<len;i++)sum+=onsets[i];
 const mean=sum/len;
 const centered=new Float32Array(len);
 let variance=0;
 for(let i=0;i<len;i++){centered[i]=onsets[i]-mean;variance+=centered[i]*centered[i];}
 if(variance<1e-8)return {bpm:null,confidence:0};
 const candidates=[];
 const minLag=Math.ceil(60/(210*frameDuration));
 const maxLag=Math.floor(60/(50*frameDuration));
 for(let lag=minLag;lag<=maxLag;lag++){
  let cov=0,p=0,q=0;
  for(let i=lag;i<len;i++){const a=centered[i],b=centered[i-lag];cov+=a*b;p+=a*a;q+=b*b;}
  const corr=cov/Math.sqrt(Math.max(1e-12,p*q));
  const bpm=60/(lag*frameDuration);
  const prior=1-.12*Math.abs(Math.log2(bpm/110));
  candidates.push({bpm,score:corr*Math.max(.8,prior)});
 }
 candidates.sort((a,b)=>b.score-a.score);
 const best=candidates[0];
 if(!best||best.score<.13)return {bpm:null,confidence:round(Math.max(0,best?.score||0))};
 return {bpm:Math.round(best.bpm),confidence:round(clamp((best.score-.08)*1.65))};
}
function estimateKey(pcm,sampleRate){
 const frameSize=2048;
 if(pcm.length<frameSize*2)return {key:null,mode:null,confidence:0};
 const step=Math.max(frameSize,Math.floor((pcm.length-frameSize)/55));
 const bins=Array.from({length:36},(_,n)=>{
  const midi=48+n;
  const freq=440*Math.pow(2,(midi-69)/12);
  const coefficient=2*Math.cos(2*Math.PI*freq/sampleRate);
  return {pc:midi%12,coefficient};
 });
 const chroma=new Float64Array(12);
 let used=0;
 for(let start=0;start+frameSize<pcm.length&&used<56;start+=step){
  const amplitudes=new Float64Array(36);
  let total=0;
  for(let j=0;j<bins.length;j++){
   const coefficient=bins[j].coefficient;
   let q0=0,q1=0,q2=0;
   for(let k=0;k<frameSize;k++){
    const sample=pcm[start+k]*(.5-.5*Math.cos(2*Math.PI*k/(frameSize-1)));
    q0=coefficient*q1-q2+sample;q2=q1;q1=q0;
   }
   const power=Math.max(0,q1*q1+q2*q2-coefficient*q1*q2);
   amplitudes[j]=Math.sqrt(power);
   total+=amplitudes[j];
  }
  if(total<.01)continue;
  for(let j=0;j<bins.length;j++)chroma[bins[j].pc]+=amplitudes[j]/total;
  used++;
 }
 if(used<3)return {key:null,mode:null,confidence:0};
 const total=chroma.reduce((a,b)=>a+b,0);
 if(total<.01)return {key:null,mode:null,confidence:0};
 const scores=[];
 for(let root=0;root<12;root++)for(const [mode,profile] of [["major",MAJOR],["minor",MINOR]]){
  let covariance=0,varX=0,varY=0,meanX=0,meanY=0;
  for(let i=0;i<12;i++){meanX+=chroma[(i+root)%12];meanY+=profile[i];}
  meanX/=12;meanY/=12;
  for(let i=0;i<12;i++){
   const x=chroma[(i+root)%12]-meanX,y=profile[i]-meanY;
   covariance+=x*y;varX+=x*x;varY+=y*y;
  }
  scores.push({key:PC[root],mode,score:covariance/Math.sqrt(Math.max(1e-12,varX*varY))});
 }
 scores.sort((a,b)=>b.score-a.score);
 const best=scores[0],runnerUp=scores[1];
 const confidence=clamp((best.score-.18)*.75+(best.score-runnerUp.score)*1.4);
 if(best.score<.34||confidence<.16)return {key:null,mode:null,confidence:round(confidence)};
 return {key:best.key,mode:best.mode,confidence:round(confidence)};
}
export function analyzePCM(samples,sampleRate=11025){
 if(!samples||samples.length<sampleRate*.7)throw Error("Provide at least 0.7 seconds of audible music.");
 const hop=256,frame=512,count=Math.floor((samples.length-frame)/hop);
 const onsets=new Float32Array(count);
 let oldTransient=0,sumSq=0,absSignal=0,absDiff=0;
 for(let i=0;i<samples.length;i++){const x=samples[i];sumSq+=x*x;absSignal+=Math.abs(x);if(i)absDiff+=Math.abs(x-samples[i-1]);}
 const rms=Math.sqrt(sumSq/samples.length);
 const isSilent=rms<.003;
 for(let f=0;f<count;f++){
  const start=f*hop;let change=0,abs=0;
  for(let i=start+1;i<start+frame;i++){change+=Math.abs(samples[i]-samples[i-1]);abs+=Math.abs(samples[i]);}
  const transient=change/Math.max(1,frame-1);
  const onset=Math.max(0,transient-oldTransient*.85);
  onsets[f]=onset*(.4+.6*Math.min(1,transient/Math.max(.00001,abs/frame)));
  oldTransient=transient;
 }
 const tempo=isSilent?{bpm:null,confidence:0}:estimateTempo(onsets,hop/sampleRate);
 const tonal=isSilent?{key:null,mode:null,confidence:0}:estimateKey(samples,sampleRate);
 const energy=round(clamp(rms/.26));
 const brightness=round(clamp(absDiff/Math.max(1e-6,absSignal)*1.4));
 const rhythmStrength=tempo.confidence;
 const mood=isSilent?"Neutral":energy>.68?(brightness>.30?"Energetic":"Intense"):energy<.25?"Relaxed":brightness<.22?"Reflective":brightness>.45?"Bright":"Neutral";
 let styleHint="Unclassified";
 if(!isSilent&&tempo.bpm!==null&&rhythmStrength>.20){
  if(tempo.bpm>=125&&energy>.36)styleHint="Rhythmic / electronic";
  else if(tempo.bpm>=65&&tempo.bpm<=116&&brightness>.26)styleHint="Percussive / beat-driven";
  else styleHint="Pop / melodic";
 }else if(!isSilent&&energy<.28)styleHint="Ambient / atmospheric";
 else if(!isSilent&&brightness<.24)styleHint="Acoustic / organic";
 const confidence=round(clamp((tempo.confidence+tonal.confidence)/2));
 return {version:ANALYSIS_VERSION,duration:round(samples.length/sampleRate,2),bpm:tempo.bpm,
  key:tonal.key,mode:tonal.mode,energy,brightness,rhythmStrength,mood,styleHint,confidence};
}
export async function analyzeAudioFile(file){
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;
 if(!AudioContextClass)throw Error("This browser does not support audio analysis.");
 const ctx=new AudioContextClass();
 try{
  const decoded=await ctx.decodeAudioData(await file.arrayBuffer());
  if(!decoded.duration||decoded.duration<.7)throw Error("Audio is too short to analyze.");
  return analyzePCM(toMono(decoded),11025);
 }finally{await ctx.close();}
}
