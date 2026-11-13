import {test} from "node:test";
import assert from "node:assert/strict";
import {validateAudioFile,validateAudioMetadata,AUDIO_MAX_BYTES} from "./audio.js";
const mp3=Buffer.alloc(96);mp3.write("ID3",0,"ascii");
const wav=Buffer.alloc(96);wav.write("RIFF",0,"ascii");wav.write("WAVE",8,"ascii");
test("audio upload validates MP3 and WAV magic bytes",()=>{
 assert.equal(validateAudioFile(mp3,"audio/mpeg").mimeType,"audio/mpeg");
 assert.equal(validateAudioFile(wav,"audio/wav").mimeType,"audio/wav");
 assert.ok(validateAudioFile(mp3,"audio/wav").error);
 assert.ok(validateAudioFile(Buffer.alloc(100),"audio/mpeg").error);
 assert.ok(validateAudioFile(mp3,"text/plain").error);
});
test("audio rejects oversized files and malformed metadata",()=>{
 assert.ok(validateAudioFile(Buffer.alloc(AUDIO_MAX_BYTES+1),"audio/mpeg").error);
 assert.equal(validateAudioMetadata("My demo","vocal").kind,"vocal");
 assert.ok(validateAudioMetadata("A","music").error);
 assert.ok(validateAudioMetadata("A valid title","not-music").error);
});
