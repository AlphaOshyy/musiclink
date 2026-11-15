export const VOCAL_VERSION="musiclink-vocal-dsp-v1";
const bound=(value,low,high)=>typeof value==="number"&&Number.isFinite(value)&&value>=low&&value<=high;
const keys=["version","duration","lowHz","highHz","medianHz","lowNote","highNote","voicedFraction","stability","confidence","characteristic"];
const notes=/^(?:C|C#|D|D#|E|F|F#|G|G#|A|A#|B)[1-7]$/;
const characteristics=["Insufficient voiced audio","Sparse voiced passages","Mostly steady pitch","Moderately varied pitch","Wide pitch movement"];
export function validateVocalAnalysis(input){
 if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).some(k=>!keys.includes(k)))return {error:"Invalid vocal analysis data."};
 if(input.version!==VOCAL_VERSION||!bound(input.duration,.5,180)||!bound(input.voicedFraction,0,1)||!bound(input.confidence,0,1)||!characteristics.includes(input.characteristic))return {error:"Invalid vocal analysis metadata."};
 const absent=input.lowHz===null&&input.highHz===null&&input.medianHz===null&&input.lowNote===null&&input.highNote===null&&input.stability===null;
 const present=bound(input.lowHz,75,900)&&bound(input.highHz,75,900)&&bound(input.medianHz,75,900)&&input.lowHz<=input.medianHz&&input.medianHz<=input.highHz&&notes.test(input.lowNote)&&notes.test(input.highNote)&&bound(input.stability,0,1);
 if(!absent&&!present)return {error:"Invalid detected vocal range."};
 if(absent&&input.characteristic!=="Insufficient voiced audio")return {error:"Unknown vocal range requires insufficient audio status."};
 if(present&&input.characteristic==="Insufficient voiced audio")return {error:"Contradictory vocal analysis."};
 return {analysis:{...Object.fromEntries(keys.map(k=>[k,input[k]])),source:"browser-estimate",updatedAt:new Date()}};
}
