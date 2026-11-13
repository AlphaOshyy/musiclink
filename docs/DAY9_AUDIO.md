# Day 9: Audio uploads and previews

Creators upload up to five short music or clean vocal audio examples, MP3 or WAV, with a 2 MB limit per file. Stored clips are separate AudioSample MongoDB documents with owner, title, kind, MIME type, byte count and binary audio. No third-party storage or payment services. Browser performs a basic playback duration check where metadata is available, while server enforces byte size and file header only. Uploads must be audio owned or licensed by the creator.

Authenticated endpoints:
- POST /api/me/audio?title=...&kind=music|vocal, raw MP3 or WAV body, bearer token
- GET /api/me/audio, metadata for owner
- GET /api/creators/:id/audio, metadata of a creator, for logged-in users
- GET /api/audio/:id, binary playback, bearer token
- DELETE /api/me/audio/:id, owner only

Client fetches audio as a protected Blob URL. No public storage URLs or JWT in URLs. Files remain available for subsequent BPM, key and pitch analysis milestones. Limitations: 2 MB excludes high quality long tracks, no waveform extraction yet, browser play requires the user to press Play, audio content detection checks file signatures, not full decoding or virus scans. MIME sniffing prevents common mislabeling but cannot guarantee safety of every possible binary. Audio content is played in native browser media controls. User uploads and deletes require sign-in.
