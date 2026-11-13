# Day 10: Experimental automatic music analysis

MusicLink now analyzes short MP3/WAV samples in the browser via Web Audio API. Data is derived from decoded PCM without uploading raw audio to third-party DSP services. Downsampling targets 11,025 Hz, and the DSP uses up to 160 seconds of audio.

Algorithms:
- Energy: RMS amplitude normalized to a unit interval.
- Brightness: first-difference magnitude relative to absolute signal amplitude, a rough high-frequency activity proxy.
- Tempo: positive transient novelty in 256-sample hops, scored by normalized autocorrelation for 50–210 BPM.
- Key: Goertzel magnitude aggregated by chroma for MIDI notes 48–83, correlated with Krumhansl-Schmuckler major/minor profiles. Uncertain keys are reported as unknown.
- Rhythmic strength: bounded autocorrelation score.
- Mood and style hint: heuristic mapping of energy, brightness and tempo. These are NOT validated genre/mood models. Human review is necessary for real-world classification.

Workflow: browser decodes uploaded audio before storing it. Once the server stores the file, the browser persists a versioned feature record through PUT /api/me/audio/:id/analysis, restricted to the owning user. The same action is available as Analyze for existing samples. Both the owner and authenticated creators see measured metadata in the existing Portfolio and creator pages.

Data integrity and limitations: backend validates ranges, field names, version and ownership, not whether measurements accurately describe music. The source is labeled browser-estimate. Audio metrics do not affect MCCA recommender yet. The estimates are not suitable for grading artists, identity or copyright determination. Percussive or tonal ambiguity and short recordings affect accuracy. The upper 160 seconds are analyzed. Production files remain capped at five samples and 2 MB each. No paid services or dependencies added.

Future evaluation: synthetic click tracks with target BPM, major/minor triads, recordings with known BPM/key, test corpus labeled by musicians, MAE / key classification accuracy, confusion analysis and confidence calibration.
