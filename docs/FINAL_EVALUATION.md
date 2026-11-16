# MusicLink / Final Research Evaluation Protocol
This is a measurement plan, not a claim of real-user validation.

## Research questions
RQ1: Does reciprocal MCCA place creator candidates judged relevant by music professionals above a genre-only baseline?
RQ2: Do confidence-gated acoustic signals improve ranking relevance without disadvantaging users who lack clips?
RQ3: Do participants complete creator discovery, project application and invitation workflows with acceptable efficiency?
RQ4: How accurate are tempo, musical key and vocal pitch estimates against reference-labelled audio?

## Reproducible synthetic check
Execute `cd server && node scripts/evaluate-final.mjs`. It runs three hand-labelled synthetic scenarios against eight fictional profiles and reports precision@3 and recall@3 for MCCA and genre-only ranking, a no-audio fallback identity check and the 12% audio adjustment bound. These labels are artificial and are not an estimate of real-world accuracy.

## Participant study protocol
Recruit consenting independent artists, producers and engineers. Create project descriptions with required roles, genres and skills. Have two independent music reviewers rate relevance for each creator/project pair without seeing ranking scores. Resolve disagreements using an agreed rubric. Run blinded rankings for profile MCCA, genre-only baseline and acoustic MCCA. Report precision@3, recall@3, NDCG@3, inter-rater agreement and confidence intervals. Do not fabricate data.

## Audio benchmark
Compare estimated BPM with reference tempo (mean absolute error, tolerance within 5 BPM), key against validated musical key labels (major/minor exact accuracy plus relative-key tolerance), and clean monophonic vocal pitch with annotated f0 (median absolute cents error and voiced-frame precision/recall). Measure results separately by noise level, instrumentation, clip length and device.

## Usability, security, performance
Evaluate 5 tasks: sign up, complete profile, create project, shortlist in blind mode, send/answer an invitation. Record completion time, errors and 1–5 satisfaction ratings, with consent. Keyboard-only and screen-reader navigation and reduced motion must receive manual checks. Compare mobile/desktop bundle/network use; Three.js should be absent before the user enables the room. Test access control with two accounts, oversized/invalid audio, input validation and denial of duplicate invitations.

## Constraints and data ethics
Never expose private emails, passwords, tokens, unapproved account data or private proof codes in research artifacts. Store consent and labelled outcomes separately. Report confidence and limitations. The app is a research prototype, not an independently audited recommendation engine.

## Observed synthetic evaluation result, 2026-11-16
Three scenarios, eight fictional creators: precision@3 MCCA = 0.778 and genre-only = 0.778; recall@3 MCCA = 1.000 and genre-only = 1.000. This means the synthetic benchmark found no ranking advantage for MCCA over the genre-only baseline. Use real independently labelled music collaboration tasks to evaluate the project's primary hypothesis.
