# Day 12: Audio-enhanced MCCA (Research Prototype)

The established MCCA-RCC v2 remains the default ranking method and still operates when nobody has uploaded audio.

The server combines optional acoustic compatibility as a confidence-scaled adjustment with a hard maximum blend of 12%. Signals include beat-tempo similarity with half-/double-time equivalence, estimated harmonic relations, energy similarity, and for projects requiring vocalists, overlap of owner and creator pitch ranges and median pitch. Sound comparisons happen only if BOTH creator and project owner have matching analyzed sample types with adequate confidence. Vocal comparison requires a project role such as singer, vocalist or rapper.

For music clips, confidence comes from browser tempo and chroma feature estimation. For vocal clips, confidence also depends on the proportion of voiced frames. Both are heuristic, not trained or professionally validated.

The server does not fetch raw audio bytes during ranking. It retrieves only per-clip metadata and preserves blind review by returning anonymous candidate identifiers before shortlisting. The payload explains when audio was used, which metrics were used, confidence, and whether the fallback was profile-only.

Scoring: adjusted = (1 - 0.12 * signalConfidence) * baseMCCA + (0.12 * signalConfidence) * acousticSimilarity. When audio evidence is absent, adjusted = baseMCCA, with no penalty to the candidate. This model is a research pilot and must not be described as talent measurement, genre recognition, voice identity recognition, or validated compatibility.

Limitations: an owner-supplied reference is not always an actual musical target; comparing similar voices is not automatically desirable for harmonies. Browser-supplied analysis can be manipulated. The pilot does not use raw PCM in recommendations, and output scores have no established predictive validity. Use human listening and annotated evaluation to judge practical usefulness. Matching performance benchmarks should compare full MCCA, profile-only baseline, and genre-only baseline using explicit metrics, ablations and contributor feedback.

Access: only the project owner can request recommendations. Blind responses withhold names, user IDs and raw skill/genre/profession fields for unshortlisted creators; selected users are revealed after shortlist. Existing invitations, verification and portfolios remain unchanged.
