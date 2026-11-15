import test from "node:test";
import assert from "node:assert/strict";
import {audioCompatibility,vocalCompatibility,combineAcoustic,audioAdjustedScore,AUDIO_BLEND} from "./audio-matching.js";
const music={version:"musiclink-browser-dsp-v1",source:"browser-estimate",confidence:.8,bpm:120,key:"C",mode:"major",energy:.55};
const vocal={version:"musiclink-vocal-dsp-v1",source:"browser-estimate",confidence:.85,lowHz:196,highHz:392,medianHz:261.6,voicedFraction:.85};
test("identical music clips return full similarity with bounded ranking impact",()=>{
 const c=audioCompatibility(music,music);
 assert.equal(c.score,100);
 assert.ok(audioAdjustedScore(70,c)>70);
 assert.ok(audioAdjustedScore(70,c)<=70+30*AUDIO_BLEND);
});
test("half tempo is recognized without exact BPM match",()=>{
 assert.equal(audioCompatibility(music,{...music,bpm:60}).factors.tempo,100);
});
test("relative musical key has high similarity",()=>{
 assert.equal(audioCompatibility(music,{...music,key:"A",mode:"minor"}).factors.harmony,95);
});
test("missing and unreliable music cannot alter profile ranking",()=>{
 assert.equal(audioCompatibility(null,music),null);
 assert.equal(audioCompatibility(music,{...music,confidence:.1}),null);
 assert.equal(audioAdjustedScore(79,null),79);
});
test("candidate with different music attributes scores lower",()=>{
 const a=audioCompatibility(music,{...music,key:"F#",mode:"minor",bpm:78,energy:.03});
 assert.ok(a.score<90);
});
test("valid vocal excerpts produce explainable range overlap",()=>{
 const c=vocalCompatibility(vocal,{...vocal});
 assert.equal(c.score,100);
 assert.equal(c.factors.vocalRange,100);
 assert.ok(c.confidence>0);
});
test("vocal analysis with no voiced evidence is neutral",()=>{
 assert.equal(vocalCompatibility(vocal,{...vocal,voicedFraction:.12}),null);
 assert.equal(vocalCompatibility(vocal,{...vocal,lowHz:null}),null);
});
test("audio never leaks identity and missing modality does not penalize",()=>{
 assert.equal(combineAcoustic(null,null),null);
 const m=audioCompatibility(music,music);
 const v=vocalCompatibility(vocal,vocal);
 const both=combineAcoustic(m,v);
 assert.deepEqual(both.sources,["music","vocal"]);
 assert.ok(!JSON.stringify(both).includes("creatorId"));
 assert.equal(combineAcoustic(m,null).score,m.score);
});
test("low confidence limits score influence",()=>{
 const c=audioCompatibility({...music,confidence:.21},{...music,confidence:.21});
 assert.ok(audioAdjustedScore(50,c)-50<=50*AUDIO_BLEND*.22);
});
