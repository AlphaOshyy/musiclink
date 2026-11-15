/**
 * Day 12 acoustic compatibility, deliberately separate from the established
 * MCCA v2 profile factors. Only measured descriptors shared by two clips are
 * compared. Missing/low-confidence audio does not penalize candidates.
 *
 * Input is untrusted browser DSP metadata. This is an exploratory heuristic,
 * not a genre classifier, talent score, or evidence of a good collaboration.
 */
export const AUDIO_BLEND=0.12;
const clamp=x=>Math.max(0,Math.min(1,x));
const round=x=>Math.round(x*100)/100;
const pcs=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const enough=x=>x&&x.source==="browser-estimate"&&x.version==="musiclink-browser-dsp-v1"&&Number.isFinite(x.confidence)&&x.confidence>=.2;
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const describe=x=>({bpm:x.bpm??null,key:x.key??null,mode:x.mode??null,energy:finite(x.energy)?round(x.energy):null});
export function audioCompatibility(reference,candidate){
 if(!enough(reference)||!enough(candidate))return null;
 const factors={};
 const r=reference,c=candidate;
 if(finite(r.energy)&&finite(c.energy)&&r.energy>=0&&r.energy<=1&&c.energy>=0&&c.energy<=1){
  factors.energy=round(100*clamp(1-Math.abs(r.energy-c.energy)));
 }
 if(finite(r.bpm)&&finite(c.bpm)&&r.bpm>=50&&c.bpm>=50&&r.bpm<=210&&c.bpm<=210){
  // half/double tempo equivalence, common in DAW beat interpretation.
  const dist=Math.min(...[.5,1,2].map(m=>Math.abs(12*Math.log2(r.bpm/(c.bpm*m)))));
  factors.tempo=round(100*clamp(1-dist/8));
 }
 if(pcs.includes(r.key)&&pcs.includes(c.key)&&["major","minor"].includes(r.mode)&&["major","minor"].includes(c.mode)){
  const root1=pcs.indexOf(r.key),root2=pcs.indexOf(c.key);
  // Compatible or closely related musical keys are a hint, not a rule.
  const same=root1===root2&&r.mode===c.mode;
  const relative=(r.mode==="major"&&c.mode==="minor"&&(root1+9)%12===root2)
    ||(r.mode==="minor"&&c.mode==="major"&&(root1+3)%12===root2);
  const fifth=Math.min((root1-root2+12)%12,(root2-root1+12)%12)===5;
  factors.harmony=same?100:relative?95:fifth?80:40;
 }
 const entries=Object.entries(factors);
 if(!entries.length)return null;
 const weights={tempo:.4,harmony:.35,energy:.25};
 const total=entries.reduce((s,[name])=>s+weights[name],0);
 const score=round(entries.reduce((s,[name,v])=>s+weights[name]*v,0)/total);
 const quality=round(clamp(Math.min(reference.confidence,candidate.confidence)));
 return {score,factors,confidence:quality,reference:describe(reference),candidate:describe(candidate),
  explanation:"Audio fit compares estimated tempo, harmony and energy where both clips provide usable measurements. It is not a judgment of musician skill."};
}
export function audioAdjustedScore(base,compatibility){
 if(!compatibility)return base;
 // Strength scaled down for uncertain low-confidence DSP, with bounded effect.
 const strength=AUDIO_BLEND*compatibility.confidence;
 return round(Math.max(0,Math.min(100,(1-strength)*base+strength*compatibility.score)));
}
