# MusicLink

MusicLink is a prototype for independent musicians. Its new core concept is **BlindMatch**, a profile blind audition workflow for finding collaborators based on project fit before public popularity signals are revealed.

## Current prototype

The GitHub Pages site currently provides:
- A BlindMatch project brief form.
- Sample anonymous audition cards.
- Local audition submission with optional audio preview.
- Configurable ratings and a transparent compatibility score.
- Ranking by fit and profile reveal for auditions rated 4/5 or higher.
- Existing release planning, artist profile, promotion, studio and collaboration tools.

The BlindMatch demo stores project details, audition metadata and ratings in the browser's local storage. Uploaded audio previews use temporary browser object URLs. They are not uploaded to a server and do not survive a page reload. The current site does not provide real accounts, secure multi-user blind review, server-side permissions or production media storage.

## Run locally

Open `index.html` in a modern browser, or serve the folder with any static web server. No build step or paid API is required.

## Planned HNDSE full-stack architecture

- Frontend: HTML/CSS/JavaScript prototype, later React with Vite.
- API: Node.js and Express.
- Database: MongoDB with Mongoose.
- Media: object storage for audio and artwork.
- Testing: unit, API and browser workflow tests.

## Core BlindMatch workflow

1. Create a project brief with the needed role, language, genre, mood and delivery requirements.
2. Creators submit audition metadata and an audio clip.
3. The owner reviews anonymous audition cards and rates musical fit.
4. A transparent scoring function ranks eligible submissions.
5. The owner reveals profiles for shortlisted auditions.
6. A selected collaborator enters a tracked project workflow.

Blind review hides profile fields in the first-stage interface. It does not guarantee anonymity because voice and musical style can be recognizable.

## Documentation

See [docs/BLINDMATCH_PROJECT_SPEC.md](docs/BLINDMATCH_PROJECT_SPEC.md) for the proposed problem statement, scope, data model, API plan, algorithm and evaluation method.

## Status

This is an early browser prototype. Do not use it for private unreleased music, real identity verification, legal ownership claims or confidential collaboration data until server-side authentication, authorization, secure media handling and privacy controls are implemented.
