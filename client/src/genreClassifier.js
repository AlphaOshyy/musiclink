/**
 * MusicLink optional automated broad-genre classification.
 * Model: onnx-community/Musical-genres-Classification-Hubert-V1-ONNX
 * Trained for ten GTZAN music genres, NOT subgenres such as drill or trap.
 * The 24 MB quantized model is fetched by Transformers.js on first use.
 * Audio data remains local; the model files are fetched from Hugging Face.
 */
import {toMono} from "./musicAnalysis.js";
export const GENRE_MODEL="onnx-community/Musical-genres-Classification-Hubert-V1-ONNX";
const allowed=new Set(["blues","classical","country","disco","hiphop","jazz","metal","pop","reggae","rock"]);
let cached=null;
const clamp=x=>Math.max(0,Math.min(1,x));
export function normalizeGenres(results){
 const ranked=(Array.isArray(results)?results:[])
 .filter(x=>x&&typeof x.label==="string"&&allowed.has(x.label.toLowerCase())&&Number.isFinite(x.score))
 .map(x=>({label:x.label.toLowerCase(),score:Number(clamp(x.score).toFixed(4))}))
 .sort((a,b)=>b.score-a.score).slice(0,3);
 return ranked.length?{
  genre:ranked[0].label==="hiphop"?"Hip Hop":ranked[0].label.charAt(0).toUpperCase()+ranked[0].label.slice(1),
  genreConfidence:ranked[0].score,
  genreCandidates:ranked,
  genreModel:GENRE_MODEL
 }:null;
}
async function getClassifier(){
 if(!cached){
  cached=(async()=>{
   const {pipeline}=await import("@huggingface/transformers");
   return await pipeline("audio-classification",GENRE_MODEL,{dtype:"q8",device:"wasm"});
  })().catch(err=>{cached=null;throw err});
 }
 return cached;
}
export async function predictMusicGenre(file){
 if(typeof window==="undefined")throw Error("Audio genre analysis needs a browser.");
 const Ctx=window.AudioContext||window.webkitAudioContext;
 if(!Ctx)throw Error("This browser cannot decode music.");
 const ctx=new Ctx();
 let data;
 try{
  const decoded=await ctx.decodeAudioData(await file.arrayBuffer());
  if(decoded.duration<1)throw Error("Use a longer music excerpt for genre classification.");
  // Full clip up to 12 seconds. Classifier uses its own 16 kHz preprocessor.
  data=toMono(decoded,16000,12);
 }finally{await ctx.close()}
 const classifier=await getClassifier();
 const results=await classifier(data,{topk:3});
 const predicted=normalizeGenres(results);
 if(!predicted)throw Error("Genre recognition returned no supported labels.");
 return predicted;
}
