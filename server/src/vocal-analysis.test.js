import test from "node:test";
import assert from "node:assert/strict";
import {validateVocalAnalysis,VOCAL_VERSION} from "./vocal-analysis.js";
const data={version:VOCAL_VERSION,duration:3,lowHz:210,highHz:230,medianHz:220,lowNote:"G#3",highNote:"A#3",voicedFraction:.8,stability:.9,confidence:.85,characteristic:"Mostly steady pitch"};
test("valid vocal range accepted and marked browser estimate",()=>{
 const result=validateVocalAnalysis(data);
 assert.equal(result.analysis.medianHz,220);
 assert.equal(result.analysis.source,"browser-estimate");
});
test("unknown range accepted when voices are not detected",()=>{
 const result=validateVocalAnalysis({...data,lowHz:null,highHz:null,medianHz:null,lowNote:null,highNote:null,stability:null,voicedFraction:0,confidence:0,characteristic:"Insufficient voiced audio"});
 assert.equal(result.analysis.lowHz,null);
});
test("rejects spoofed and inconsistent vocal metadata",()=>{
 for(const item of [{...data,source:"trusted"},{...data,highHz:100},{...data,stability:2},{...data,lowNote:"Z8"},{...data,version:"other"},{...data,medianHz:null}]){
  assert.ok(validateVocalAnalysis(item).error,JSON.stringify(item));
 }
});
