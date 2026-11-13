import test from "node:test";
import assert from "node:assert/strict";
import {analyzePCM,estimateTempo,ANALYSIS_VERSION} from "./musicAnalysis.js";
test("tempo estimator identifies periodic click onsets",()=>{
 const frameDuration=256/11025,frames=500,period=Math.round(60/120/frameDuration);
 const onsets=new Float32Array(frames);
 for(let i=0;i<frames;i+=period)onsets[i]=1;
 const tempo=estimateTempo(onsets,frameDuration);
 assert.ok(Math.abs(tempo.bpm-120)<8,JSON.stringify(tempo));
});
test("silent audio produces unknown BPM and key",()=>{
 const a=analyzePCM(new Float32Array(11025*4));
 assert.equal(a.version,ANALYSIS_VERSION);
 assert.equal(a.bpm,null);assert.equal(a.key,null);
 assert.equal(a.mood,"Neutral");assert.equal(a.styleHint,"Unclassified");
});
test("synthesized chord returns bounded metrics",()=>{
 const rate=11025,seconds=4,samples=new Float32Array(rate*seconds);
 const pitches=[261.63,329.63,392];
 for(let i=0;i<samples.length;i++){for(const f of pitches)samples[i]+=.09*Math.sin(2*Math.PI*f*i/rate);}
 const result=analyzePCM(samples,rate);
 assert.ok(result.energy>0);assert.ok(result.energy<=1);
 assert.ok(result.confidence>=0&&result.confidence<=1);
 assert.ok(result.key===null||typeof result.key==="string");
});
test("short sample rejected",()=>{
 assert.throws(()=>analyzePCM(new Float32Array(1000)),/at least/);
});
