# Day 11 / Vocal Pitch Estimation

MusicLink uses browser-side Web Audio decoding plus normalized autocorrelation to estimate pitch in vocal-only recordings. Outputs include estimated 10th-to-90th percentile frequency range and nearest notes, median frequency, the proportion of voiced frames, pitch variation over the excerpt, a broad pattern description, and signal confidence.

The UI allows artists to upload samples labeled Vocal; vocal analysis is run at upload and by the Analyze action. Uploaded music samples do not receive a vocal profile. Existing file storage, Day 10 music analysis, the creator directory, and the MCCA matching system remain unchanged.

An authenticated creator updates vocal analysis only on their own vocal sample using PUT /api/me/audio/:id/vocal-analysis. The backend validates version, type, ranges, consistency and ownership. Creator profiles display saved vocal estimates without exposing raw PCM to third parties.

IMPORTANT limitations: no singer identification, legal identity, sex or gender recognition, health inference, singing-ability scores, or clinical claims. Background music, polyphony, octave errors, vibrato and microphone conditions affect pitch reliability. Stability means consistency of detected pitch, and melodic variation is natural, so lower stability is not a quality defect. Server validates client-submitted metadata but cannot certify the signal analysis itself. Test against annotated clean vocals before treating these features as empirically validated. No third-party machine learning, upload to analysis services, or paid APIs.
