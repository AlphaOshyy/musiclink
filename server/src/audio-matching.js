/**
 * Day 12: optional acoustic compatibility pilot for MusicLink MCCA-RCC.
 *
 * Reference and candidate metadata come from browser DSP, not a trained model.
 * No valid pair => NO change to MCCA. The combined acoustic influence is
 * strictly capped at 12% and fades with the weakest signal confidence.
 * Vocal pitch is a range comparison, never a score of singing ability.
 */
export const AUDIO_BLEND=.12;
const clamp=x=>Math.max(0,Math.min(1,x));
const round=x=>Math.round(x*100)/100;
const pcs=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const MUSIC_VERSION="musiclink-browser-dsp-v1",VOCAL_VERSION="musiclink-vocal-dsp-v1";
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const trusted=(a,version)=>a&&a.version===version&&a.source==="browser-estimate"&&finite(a.confidence)&&a.confidence>=.2&&a.confidence<=1;
const between=(v,a,b)=>finite(v)&&v>=a&&v<=b;
export function audioCompatibility(reference,candidate){
 if(!trusted(reference,MUSIC_VERSION)||!trusted(candidate,MUSIC_VERSION))return null;
 const factors={};
 const r=reference,c=candidate;
 if(between(r.energy,0,1)&&between(c.energy,0,1))
  factors.energy=round(100*clamp(1-Math.abs(r.energy-c.energy)));
 if(between(r.bpm,50,210)&&between(c.bpm,50,210)){
  const dist=Math.min(...[.5,1,2].map(m=>Math.abs(12*Math.log2(r.bpm/(c.bpm*m)))));
  factors.tempo=round(100*clamp(1-dist/8));
 }
 if(pcs.includes(r.key)&&pcs.includes(c.key)&&["major","minor"].includes(r.mode)&&["major","minor"].includes(c.mode)){
  const a=pcs.indexOf(r.key),b=pcs.indexOf(c.key);
  const same=a===b&&r.mode===c.mode;
  const relative=(r.mode==="major"&&c.mode==="minor"&&(a+9)%12===b)
   ||(r.mode==="minor"&&c.mode==="major"&&(a+3)%12===b);
  const fifth=Math.min((a-b+12)%12,(b-a+12)%12)===5;
  factors.harmony=same?100:relative?95:fifth?80:40;
 }
 const entries=Object.entries(factors);
 if(!entries.length)return null;
 const weights={tempo:.4,harmony:.35,energy:.25};
 const total=entries.reduce((s,[name])=>s+weights[name],0);
 const score=round(entries.reduce((s,[name,v])=>s+weights[name]*v,0)/total);
 const confidence=round(clamp(Math.min(r.confidence,c.confidence)));
 return {score,factors,confidence,type:"music",
  explanation:"Estimated tempo, harmonic relation and energy from music clips. Similarity does not measure musical ability."};
}
export function vocalCompatibility(reference,candidate){
 if(!trusted(reference,VOCAL_VERSION)||!trusted(candidate,VOCAL_VERSION))return null;
 const r=reference,c=candidate;
 if(!between(r.lowHz,75,900)||!between(r.highHz,75,900)||!between(r.medianHz,75,900)
  ||!between(c.lowHz,75,900)||!between(c.highHz,75,900)||!between(c.medianHz,75,900)
  ||r.lowHz>r.highHz||c.lowHz>c.highHz||!between(r.voicedFraction,0,1)||!between(c.voicedFraction,0,1))
  return null;
 // Uncertain or sparse voiced excerpts are not used to rank.
 if(r.voicedFraction<.25||c.voicedFraction<.25)return null;
 const midi=hz=>69+12*Math.log2(hz/440);
 const a1=midi(r.lowHz),a2=midi(r.highHz),b1=midi(c.lowHz),b2=midi(c.highHz);
 const overlap=Math.max(0,Math.min(a2,b2)-Math.max(a1,b1));
 const union=Math.max(a2,b2)-Math.min(a1,b1);
 const range=union<.001?100:round(100*overlap/union);
 const distance=Math.abs(midi(r.medianHz)-midi(c.medianHz));
 const center=round(100*clamp(1-distance/12));
 const score=round(.6*range+.4*center);
 const confidence=round(clamp(Math.min(r.confidence,c.confidence)*Math.min(r.voicedFraction,c.voicedFraction)));
 return {score,factors:{vocalRange:range,pitchCenter:center},confidence,type:"vocal",
  explanation:"Estimated overlap between two vocal excerpts. This measures range similarity, not skill, vocal identity or suitability for every melody."};
}
export function combineAcoustic(music,vocal){
 if(!music&&!vocal)return null;
 if(!music)return {...vocal,sources:["vocal"]};
 if(!vocal)return {...music,sources:["music"]};
 // Two independently measured types, weighted by reliability.
 const total=music.confidence+vocal.confidence;
 const score=round((music.score*music.confidence+vocal.score*vocal.confidence)/total);
 // Keep influence conservative when only a fraction of an excerpt is voiced.
 const confidence=round(clamp((music.confidence+vocal.confidence)/2));
 return {score,confidence,type:"combined",sources:["music","vocal"],
  factors:{...music.factors,...vocal.factors},
  explanation:"Combined estimated music and vocal similarity. Both are uncertain signals and never measures of musical ability."};
}
export function audioAdjustedScore(base,compatibility){
 if(!compatibility)return base;
 const strength=AUDIO_BLEND*clamp(compatibility.confidence);
 return round(Math.max(0,Math.min(100,(1-strength)*base+strength*compatibility.score)));
}
