import test from "node:test";
import assert from "node:assert/strict";
import {getMedia} from "./media.js";
test("trusted music platforms return provider players",()=>{
 assert.equal(getMedia("https://open.spotify.com/track/1234567890123456789012").provider,"Spotify");
 assert.equal(getMedia("https://www.youtube.com/watch?v=dQw4w9WgXcQ").embed,"https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
 assert.match(getMedia("https://soundcloud.com/artist/song").embed,/w.soundcloud.com\/player/);
});
test("unsafe hosts and unknown platforms cannot inject iframes",()=>{
 assert.equal(getMedia("javascript:alert(1)").embed,null);
 assert.equal(getMedia("https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ").embed,null);
 assert.equal(getMedia("https://example.com/music").embed,null);
});
