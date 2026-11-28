import test from "node:test";
import assert from "node:assert/strict";
import {normalizeGenres,GENRE_MODEL} from "./genreClassifier.js";
test("normalize genre classifier labels",()=>{
 const result=normalizeGenres([{label:"hiphop",score:.7},{label:"pop",score:.2},{label:"jazz",score:.1}]);
 assert.equal(result.genre,"Hip Hop");assert.equal(result.genreConfidence,.7);
 assert.equal(result.genreModel,GENRE_MODEL);assert.equal(result.genreCandidates.length,3);
});
test("unknown genres and malformed classifier output ignored",()=>{
 assert.equal(normalizeGenres([{label:"drill",score:.99}]),null);
 assert.equal(normalizeGenres(null),null);
 const x=normalizeGenres([{label:"rock",score:4},{label:"disco",score:-1}]);
 assert.equal(x.genreConfidence,1);
});
