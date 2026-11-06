# MusicLink implementation and research plan

## Must-have features
- Authentication and authorization
- Creator professional profiles and portfolio samples
- Project creation, applications and owner review
- Multi-factor MCCA scoring
- Reciprocal compatibility, RCC
- Blind vs visible candidate review with secure server-side response filtering
- Factor explanations
- Shortlisting and invitations
- Genre-only and profile-similarity baselines

## Next tasks
1. Install and run each service locally, repair any integration errors.
2. Make application and invitation views for the owners and creators complete.
3. Add profile photos, private portfolio sample upload storage and carefully anonymized blind examples.
4. Add pagination, search and spam prevention.
5. Persist evaluation sessions and blinded vs visible assessments in the database.
6. Write integration tests for API authorization and browser end-to-end tests.
7. Validate scoring assumptions with creator interviews, document ethics and consent.
8. Deploy frontend, API, recommender and MongoDB separately using proper secrets.
9. Measure recommendation performance with up to 500 candidate profiles.
10. Collect human relevance ratings and compare ranking baselines using Precision@K, Recall@K and NDCG@K.

## Two-week scope
A working MVP with core research functions is the priority. A rigorous empirical study requires real participants and cannot be represented as completed until conducted.
