# MusicLink BlindMatch: HNDSE Project Specification

## 1. Proposed title

Design and Development of MusicLink BlindMatch, a Blind Audition and Compatibility Based Collaboration Platform for Independent Musicians.

## 2. Problem statement

Independent musicians often seek collaborators through social profiles, follower counts, personal networks and unstructured messages. These signals do not reliably describe whether a creator fits a particular musical project. Project owners also lack a consistent workflow for collecting auditions, comparing submissions, revealing creator profiles and tracking the collaboration after selection.

MusicLink BlindMatch proposes a project-centred audition workflow that separates first-stage musical review from public profile information and then supports a structured selection and collaboration process.

## 3. Aim

Build and evaluate a web application that enables independent musicians to define collaboration needs, collect and review blind auditions, rank submissions using explainable criteria, reveal shortlisted creator profiles and track project progress.

## 4. Proposed contribution

The system combines four linked workflow stages:

1. A structured brief defines role, language, genre, mood and deliverables.
2. A profile-blind review interface presents anonymous audition identifiers and audio.
3. A configurable compatibility score combines brief fit, language fit, genre fit and the owner's audition rating.
4. A shortlist reveal connects selected creators to a status-tracked collaboration.

The proposed contribution is this integrated workflow and its evaluation, not a claim that anonymous auditions or music collaboration platforms have never existed. A competitor and literature review is required before making a novelty claim.

## 5. Scope for a 12-week solo project

### Must have

- Account registration and authentication in the full-stack phase.
- Creator profiles with roles, genres and languages.
- Project briefs with role, genre, language, mood, requirements and deadline.
- Audio audition upload and playback.
- Blind review responses that omit profile identity fields.
- Ratings, compatibility ranking and shortlist reveal.
- Collaboration statuses: selected, in progress, revision requested, approved and completed.
- Basic music catalog search and track playback.
- Input validation, ownership checks, tests and documentation.

### Explicitly out of scope for the first release

- Payments, royalty distribution and legal ownership verification.
- Live streaming, group audio rooms and real-time messaging.
- AI-generated music or paid AI APIs.
- Automatic vocal identity masking or a guarantee of anonymity.
- Native mobile applications and a digital audio workstation.

## 6. Current repository state

The current GitHub Pages prototype uses HTML, CSS and JavaScript. It includes:
- Project brief editing.
- Sample blind audition cards.
- Adding an audition with an optional local audio preview.
- Rating and ranking audition entries.
- Revealing profiles for entries rated 4/5 or higher.
- The existing release, promotion, artist profile, studio and collaboration tools.

The browser prototype stores metadata and ratings in local storage. Audio preview URLs are temporary browser object URLs. No audio files are uploaded to a server. This version is for interface and workflow demonstration only. Browser-side hiding is not a security boundary.

## 7. Proposed full-stack architecture

- Client: React and Vite.
- API: Node.js and Express REST endpoints.
- Database: MongoDB and Mongoose.
- Media: object storage for audio and artwork.
- Authentication: secure server-managed sessions or JWT in HTTP-only cookies.
- Testing: unit tests for scoring and state transitions, API tests for authorization, and browser tests for critical workflows.

The API must enforce permissions. It must return only anonymous audition fields during blind review, then permit profile access only after the project's authorized reveal step. Never rely on CSS or client-side flags to protect identity fields.

## 8. Data model

### users

- `_id`
- `displayName`
- `emailNormalized`
- `passwordHash`
- `roles`
- `genres`
- `languages`
- `bio`
- `createdAt`

### projects

- `_id`
- `ownerId`
- `title`
- `requiredRole`
- `brief`
- `genre`
- `language`
- `mood`
- `deadline`
- `status`
- `createdAt`

### auditions

- `_id`
- `projectId`
- `artistId`
- `audioUrl`
- `submissionNote`
- `submittedAt`
- `status`

### ratings

- `_id`
- `projectId`
- `auditionId`
- `ownerId`
- `briefFit`
- `languageFit`
- `genreFit`
- `auditionRating`
- `createdAt`

### collaborations

- `_id`
- `projectId`
- `ownerId`
- `artistId`
- `status`
- `revisionNote`
- `deadline`
- `updatedAt`

### tracks

- `_id`
- `artistId`
- `title`
- `audioUrl`
- `coverUrl`
- `genre`
- `language`
- `publishedAt`
- `status`

Use unique indexes for normalized emails and any relationship that must not be duplicated. Validate ownership and state transitions in the API. Store media outside MongoDB and store only metadata and access-controlled URLs in documents.

## 9. Compatibility scoring

A possible initial formula is:

`score = 0.30 × briefFit + 0.25 × languageFit + 0.20 × genreFit + 0.25 × auditionRating`

Normalize all components to 0 through 100. Convert the owner's 1 through 5 rating to 20 through 100. Define brief fit from role, mood and explicit requirements. Initial weights are design assumptions and should be documented and tested, not described as optimal.

The score is decision support. The project owner makes the final selection. Popularity and follower counts should not be inputs to the first-stage score.

## 10. API plan

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects/:id/auditions`
- `GET /api/projects/:id/auditions/blind`
- `POST /api/auditions/:id/ratings`
- `GET /api/projects/:id/shortlist`
- `POST /api/projects/:id/reveal`
- `POST /api/projects/:id/collaboration`
- `PATCH /api/collaborations/:id/status`
- `GET /api/tracks`
- `POST /api/tracks`

The blind audition endpoint must omit artist identifiers and public profile data. The reveal endpoint must require project-owner authorization and a valid project state.

## 11. Twelve-week plan

- Weeks 1 to 2: requirements, competitor review, UML, wireframes, schema and repository setup.
- Weeks 3 to 4: authentication, profiles and project briefs.
- Weeks 5 to 6: audition submission, audio storage, playback and blind review.
- Weeks 7 to 8: scoring, ratings, shortlist, profile reveal and collaboration statuses.
- Weeks 9 to 10: music catalog, security checks, integration and responsive polish.
- Week 11: functional tests, user evaluation, fixes and deployment.
- Week 12: report, diagrams, results, user guide and viva preparation.

If the schedule slips, preserve the blind audition workflow, authorization and evaluation. Defer optional catalog analytics and visual enhancements.

## 12. Evaluation plan

Compare two review workflows with comparable audition sets:

- Profile-first: participants see creator profiles before choosing.
- Blind-first: participants listen and rate anonymous auditions before profile reveal.

Possible measures:
- Time taken to shortlist.
- Selection differences between workflows.
- Agreement between audition ratings and selected candidates.
- Perceived fairness using the same questionnaire in both conditions.
- Task completion rate and usability feedback.
- API response time once the backend exists.

Use consenting participants and disclose the prototype's limitations. With a small sample, report descriptive statistics and qualitative feedback. Avoid causal or industry-wide claims unsupported by the sample.

## 13. Risks and controls

- Identity may be inferred from voice or style. Describe the feature as profile-blind review, not guaranteed anonymity.
- Browser local storage is not suitable for confidential project data. Move private data to an authenticated backend before real use.
- Unreleased audio is sensitive. Implement private media access and deletion controls before inviting real creators.
- Compatibility scores can embed subjective assumptions. Expose criteria, allow human review and document limitations.
- Small evaluation samples limit generalization. Report sample size and avoid overclaiming.

## 14. Acceptance criteria

- A project owner creates and edits a brief.
- A creator submits an audition and an audio file plays successfully.
- Blind review responses do not expose profile fields before reveal.
- Ratings persist correctly and ranking is deterministic for the same inputs.
- Only eligible, authorized project owners reveal shortlisted profiles.
- Collaboration status transitions reject invalid changes.
- Critical workflows pass documented functional and API tests.
- The report includes real test results and an honest limitations section.


## 13. Expanded product workspace

The interface has been expanded beyond BlindMatch into a unified artist workspace. The local prototype includes:

- Overview dashboard with project status, workspace activity and quick actions.
- Artist discovery with search and genre/role filters.
- BlindMatch audition review and profile reveal.
- Collaboration board with status, next milestone and progress editing.
- Studio track library, optional temporary audio previews and session checklist.
- Local demo conversations and outgoing message drafts.
- Release planner with a generated seven-step milestone timeline.
- Promotion lab with a seven-day campaign checklist.
- Press kit copy generator.
- Artist profile editor, notifications and local settings/reset.

These are front-end prototype workflows. Sample directory data and messages are not connected to other users; browser-local state is not shared across devices.

## 14. Production readiness boundary

The current interface must not be described as a deployed multi-user platform. Before production, implement and test authentication, server-side authorization, validated file uploads, private audio storage, rate limits, moderation/reporting, durable database persistence, backups, privacy controls and message access rules. Blind review must be enforced by the API, not merely by hiding profile fields in the browser. Consider voice identifiability when describing the feature as profile-blind.

## 15. Recommended implementation order

1. Define user stories and MongoDB schemas for users, artist profiles, projects, auditions, ratings, collaborations, tracks, releases, conversations, messages and notifications.
2. Implement authentication and ownership-based authorization.
3. Implement project CRUD and server-side audition submissions.
4. Store audio privately and expose it only to authorized project participants.
5. Implement explainable scoring as a tested service, keeping owner ratings separate from system-derived fit.
6. Add collaboration status transitions, comments and release/studio tools.
7. Add messages and notification state.
8. Test responsive browser workflows, API permissions, validation, failure states and accessibility.
9. Conduct a small user evaluation comparing first-stage profile-blind review with profile-visible review. Report sample size, method, limitations and results honestly.
