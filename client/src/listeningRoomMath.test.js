import {test} from "node:test";
import assert from "node:assert/strict";
import {bandLevels} from "./listeningRoomMath.js";
test("FFT spectrum maps into bounded bars",()=>{
 const values=bandLevels(Uint8Array.from([0,255,127,32,255,0]),12);
 assert.equal(values.length,12);
 assert.ok(values.every(x=>x>=0&&x<=1));
});
test("silent audio stays neutral",()=>{
 assert.ok(bandLevels(new Uint8Array(512),48).every(x=>x===0));
});
test("empty FFT and invalid columns are handled safely",()=>{
 assert.deepEqual(bandLevels(new Uint8Array(0),48),[]);
 assert.deepEqual(bandLevels(new Uint8Array([1,2]),0),[]);
});
