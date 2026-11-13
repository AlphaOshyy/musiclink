/**
 * Day 10 analysis metadata is computed from decoded audio in the user's browser.
 * The API validates the envelope and provenance, not the acoustical accuracy.
 */
export const ANALYSIS_VERSION="musiclink-browser-dsp-v1";
const inRange=(x,min,max)=>typeof x==="number"&&Number.isFinite(x)&&x>=min&&x<=max;
const KEYS=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const styles=["Rhythmic / electronic","Acoustic / organic","Ambient / atmospheric","Pop / melodic","Percussive / beat-driven","Unclassified"];
const moods=["Energetic","Relaxed","Reflective","Bright","Intense","Neutral"];
export function validateMusicAnalysis(payload){
 if(!payload||typeof payload!=="object"||Array.isArray(payload))return {error:"Invalid music analysis."};
 const fields=["version","duration","bpm","key","mode","energy","brightness","rhythmStrength","mood","styleHint","confidence"];
 if(Object.keys(payload).some(k=>!fields.includes(k)))return {error:"Unsupported analysis data."};
 if(payload.version!==ANALYSIS_VERSION)return {error:"Unsupported analysis version."};
 if(!inRange(payload.duration,0.5,180))return {error:"Invalid audio duration."};
 if(payload.bpm!==null&&!(inRange(payload.bpm,50,210)&&Number.isInteger(payload.bpm)))return {error:"Invalid BPM estimate."};
 if(payload.key!==null&&!KEYS.includes(payload.key))return {error:"Invalid key."};
 if(payload.mode!==null&&!["major","minor"].includes(payload.mode))return {error:"Invalid key mode."};
 if((payload.key===null)!==(payload.mode===null))return {error:"Key and mode must both be known or unknown."};
 if(!inRange(payload.energy,0,1)||!inRange(payload.brightness,0,1)||!inRange(payload.rhythmStrength,0,1)||!inRange(payload.confidence,0,1))return {error:"Invalid acoustic feature."};
 if(!moods.includes(payload.mood)||!styles.includes(payload.styleHint))return {error:"Invalid style or mood hint."};
 return {analysis:{
  version:ANALYSIS_VERSION,duration:payload.duration,bpm:payload.bpm,key:payload.key,mode:payload.mode,
  energy:payload.energy,brightness:payload.brightness,rhythmStrength:payload.rhythmStrength,
  mood:payload.mood,styleHint:payload.styleHint,confidence:payload.confidence,
  source:"browser-estimate",updatedAt:new Date()
 }};
}
