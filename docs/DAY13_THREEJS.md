# Day 13: Optional Three.js Listening Room

The approved MusicLink editorial website remains the baseline. Three.js is confined to audio previews in Portfolio and creator profiles. Users must actively select **Open 3D room**; the 3D dependency is downloaded only then, using dynamic import. The regular HTML audio player always remains present.

The visualization renders a 48-column perspective spectrum using Three.js, with a limited device-pixel ratio and an approximately 30fps frame cap. Web Audio's AnalyserNode measures frequency bins from the actual protected audio preview. Frequency magnitude drives the height and glow of 3D columns. Pointer motion subtly adjusts the viewing angle. Three-dimensional audio display is a listening aid, not a measurement of artistic skill.

Reduced-motion users do not receive the animated 3D effect. WebGL 2 failures produce a simple message and retain normal audio playback. Cleanup disposes geometry, materials, renderer, observers, RAF, and audio context when an audio preview closes. Audio source URLs remain short-lived, authentication-protected blob URLs, fetched by the existing client. Music files, authentication, verification, recommendations, and database schema are unchanged.

Three.js is a frontend-only dependency. No new server routes, paid APIs, 3D hero screens or decorative spinning logo were introduced.

Known limitation: audio-reactive graphics depend on working WebGL2 and Web Audio in the browser; media source connection changes the audio graph while 3D mode is active. Test with real MP3/WAV samples across Safari, Chrome, iPhone and low-power devices. A native audio control is always the fallback.
