import test from "node:test";
import assert from "node:assert/strict";
import {audioCompatibility,audioAdjustedScore,AUDIO_BLEND} from "./audio-matching.js";
const audio={version:"musiclink-browser-dsp-v1",source:"browser-estimate",confidence:.8,bpm:120,key:"C",mode:"major",energy:.55};
test("identical clips have high similarity and bounded influence",()=>{
 const c=audioCompatibility(audio,{...audio});
 assert.equal(c.score,100);
 assert.ok(audioAdjustedScore(70,c)>70);
 assert.ok(audioAdjustedScore(70,c)<=70+30*AUDIO_BLEND);
});
test("half-time musical phrasing counts as similar tempo",()=>{
 const c=audioCompatibility(audio,{...audio,bpm:60});
 assert.equal(c.factors.tempo,100);
});
test("missing or weak measurements preserve original ranking",()=>{
 assert.equal(audioCompatibility(null,audio),null);
 assert.equal(audioCompatibility(audio,{...audio,confidence:.1}),null);
 assert.equal(audioAdjustedScore(79,null),79);
});
test("incompatible characteristics produce lower score without talent inference",()=>{
 const a=audioCompatibility(audio,{...audio,key:"F#",mode:"minor",bpm:78,energy:.03});
 assert.ok(a.score<90);
 assert.ok(a.explanation.includes("not a judgment"));
});
test("unknown tempo/key still evaluates existing energy only",()=>{
 const c=audioCompatibility({...audio,key:null,mode:null,bpm:null},{...audio,key:null,mode:null,bpm:null,energy:.65});
 assert.ok(c);assert.deepEqual(Object.keys(c.factors),["energy"]);
});
