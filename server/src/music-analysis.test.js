import test from "node:test";
import assert from "node:assert/strict";
import {validateMusicAnalysis,ANALYSIS_VERSION} from "./music-analysis.js";
const valid={version:ANALYSIS_VERSION,duration:18.5,bpm:94,key:"C",mode:"minor",energy:.65,brightness:.41,rhythmStrength:.7,mood:"Reflective",styleHint:"Rhythmic / electronic",confidence:.46};
test("analysis accepts bounded explicit browser estimates",()=>{
 const result=validateMusicAnalysis(valid);
 assert.equal(result.analysis.source,"browser-estimate");
 assert.equal(result.analysis.bpm,94);
 assert.equal(result.analysis.key,"C");
});
test("analysis handles unknown tempo and key",()=>{
 const result=validateMusicAnalysis({...valid,bpm:null,key:null,mode:null,mood:"Neutral",styleHint:"Unclassified"});
 assert.equal(result.analysis.bpm,null);assert.equal(result.analysis.mode,null);
});
test("analysis rejects unknown properties and invalid classifications",()=>{
 for(const value of [{...valid,bpm:900},{...valid,energy:NaN},{...valid,confidence:2},{...valid,key:"H"},{...valid,key:null,mode:"minor"},{...valid,styleHint:"Guaranteed jazz"},{...valid,source:"server"},{...valid,version:"fake"},{...valid,duration:-1}]){
  assert.ok(validateMusicAnalysis(value).error);
 }
});

test("accept pretrained genre classification only with supported labels and consistent probabilities",()=>{
 const payload={version:ANALYSIS_VERSION,duration:10,bpm:120,key:"C",mode:"minor",energy:.5,brightness:.3,rhythmStrength:.7,mood:"Neutral",styleHint:"Percussive / beat-driven",confidence:.6,
 genre:"Hip Hop",genreConfidence:.8,genreCandidates:[{label:"hiphop",score:.8},{label:"pop",score:.2}],genreModel:"onnx-community/Musical-genres-Classification-Hubert-V1-ONNX"};
 assert.equal(validateMusicAnalysis(payload).analysis.genre,"Hip Hop");
 assert.ok(validateMusicAnalysis({...payload,genreModel:"other"}).error);
 assert.ok(validateMusicAnalysis({...payload,genre:"Trap"}).error);
 assert.ok(validateMusicAnalysis({...payload,genreCandidates:[{label:"pop",score:.8}]}).error);
});
