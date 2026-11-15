import test from "node:test";
import assert from "node:assert/strict";
import {analyzeVocalPCM,pitchForFrame,VOCAL_VERSION} from "./vocalAnalysis.js";
const sine=(hz,s=3,rate=11025)=>{
 const samples=new Float32Array(s*rate);
 for(let i=0;i<samples.length;i++)samples[i]=.35*Math.sin(2*Math.PI*hz*i/rate);
 return samples;
};
test("recognizes 220 Hz sustained monophonic test tone",()=>{
 const a=analyzeVocalPCM(sine(220));
 assert.equal(a.version,VOCAL_VERSION);
 assert.ok(Math.abs(a.medianHz-220)<8,JSON.stringify(a));
 assert.ok(a.confidence>.45);
 assert.equal(a.lowNote,"A3");
});
test("silent audio reports no detected vocal range",()=>{
 const a=analyzeVocalPCM(new Float32Array(11025*3));
 assert.equal(a.lowHz,null);assert.equal(a.highHz,null);assert.equal(a.stability,null);
});
test("frame pitch requires nontrivial level and periodicity",()=>{
 assert.equal(pitchForFrame(new Float32Array(4096),11025,0),null);
});
test("short recordings are rejected",()=>{
 assert.throws(()=>analyzeVocalPCM(new Float32Array(2000)),/at least/);
});
