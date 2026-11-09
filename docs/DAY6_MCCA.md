# Day 6: Explainable MCCA and reciprocal matching

## Research model

MusicLink's live Express API and Python evaluation prototype use the same deterministic five-factor weighted matching formula. No external AI provider or model key is required.

Project-to-creator fit: genre (20%), skills and required role (25%), creative tags (25%), relevant portfolio (20%), and availability (10%). Within skills/role fit, the model allocates 80% to explicit skills and 20% to the creator's profession when both requirements exist. If only one exists, it contributes the complete factor. Recognized music-role synonyms support matching Singer to Vocalist, Songwriter to Lyricist, and equivalent production/engineering titles.

Creator-to-project fit: preferred roles, genres and creative direction each contribute 30%, availability contributes 10%. Unspecified creator preferences are neutral at 100% in this prototype. Missing project attributes are neutral at 50% in the corresponding directional factors. A missing portfolio scores 0 on evidence. These are research design choices, not empirically calibrated weights.

The reciprocal compatibility score is the geometric mean, `sqrt(forward * reverse)`. The API also exposes factor contributions, summary statistics, two simple baselines (genre-only and mean genre/skill coverage), and short human-readable explanations. Scores are heuristic percentages, not predicted acceptance probabilities.

## Blind review
A project owner chooses blind or visible review. In blind mode, candidate name, profession, portfolio links, and raw genre/skill lists are omitted until shortlist. The API returns a time-limited encrypted candidate token for shortlisting. Some numerical factors and score patterns may still make a creator recognizable within a small group, so this is pseudonymous ranking, not guaranteed anonymity.

## Evaluation
Run `cd server && npm test` and `cd recommender && pytest -q`. Both implementations cover ideal matches, missing skills, role aliases, unavailable creators, reciprocal conflicts, determinism, evidence and baselines. Cross-runtime parity is specified by shared fixtures but needs broader dataset testing. Accuracy against real collaborators has not been validated. For an academic evaluation, collect consenting participants' relevance ratings and measure Precision@K, NDCG@K, and inter-rater agreement alongside the baseline rankings.

## Remaining limitations
The matching method is hand-weighted, no machine learning training is performed. Labels and genre synonyms are limited. Returning scores can still disclose indirect profile clues in blind mode. The free cloud tier uses a single Node API and MongoDB Atlas, while Python is used only for research tests.
