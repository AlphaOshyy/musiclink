# MusicLink

MusicLink is an independent artist workspace designed to bring collaborator discovery, blind auditions, project coordination, studio organization and release planning into one place.

## Full workspace redesign

The GitHub Pages prototype now has a unified app-style interface with a persistent sidebar, overview dashboard, artist discovery, BlindMatch, collaboration board, studio workspace, messages, release planner, promotion lab, press kit builder, artist profile, notifications and settings.

### Features in the browser prototype

- **Overview dashboard:** project cards, workspace metrics, activity feed and quick actions.
- **Discover artists:** sample artist directory with search and genre/role filters.
- **BlindMatch:** editable project briefs, anonymous audition cards, optional local audio preview, explainable fit scores, human ratings, ranking and shortlist profile reveal.
- **Collaboration board:** create projects, edit descriptions/status/next milestone/progress, filter by status and advance the workflow.
- **Studio workspace:** track list, local audio previews, track status and a persistent session checklist.
- **Messages:** sample conversations with local-only outgoing messages.
- **Release planner:** save releases and generate a seven-step timeline with checkable milestones.
- **Promotion lab:** create a seven-day content plan and track completion.
- **Press kit builder:** generate artist bio, highlights and official-link copy from entered details.
- **Artist profile:** edit name, location, genre, bio, skills, links and collaboration availability.
- **Notifications and settings:** read/mark notifications and reset the local demo workspace.
- **Responsive layout:** desktop sidebar and mobile navigation drawer.

## Run locally

Open index.html in a modern browser or serve the repository folder with a static web server. No build step or paid API is required.

## Important prototype limitations

This is a front-end demonstration, not a production multi-user service. Workspace records are stored in the current browser's local storage. Sample profiles, conversations, metrics and notifications are illustrative. Optional audio files use temporary browser object URLs and are not uploaded or preserved after reload. Clipboard support depends on browser permissions.

The current demo does **not** provide real authentication, server-side authorization, secure identity-blind auditions, shared database records, private cloud media storage, cross-user messages, or real-time notifications. Hiding a profile in the UI is not a security boundary, and a voice may itself identify its creator. Do not upload confidential or unreleased music.

## Planned full-stack architecture

- Frontend: React with Vite, or keep the current HTML/CSS/JavaScript interface while implementing the backend.
- API: Node.js and Express.
- Database: MongoDB with Mongoose.
- Authentication: password hashing and secure sessions or short-lived tokens.
- Media: private object storage, file validation and short-lived signed URLs.
- Messaging and notifications: database-backed conversations, unread state and optional Socket.IO.
- Testing: unit tests for matching and scoring, API authorization tests, and browser workflow tests.

## Core BlindMatch workflow

1. Create a project brief with role, language, genre, mood and delivery requirements.
2. Creators submit audition metadata and an audio file.
3. The project owner reviews blind audition IDs and rates musical fit.
4. A transparent score ranks submissions against the brief.
5. The owner reveals profiles for shortlisted auditions.
6. Selected creators move into a collaboration workflow with revisions, approval and completion.

The intended contribution is the integration and evaluation of a profile-blind audition workflow with explainable compatibility scoring and structured post-selection collaboration, not a claim that anonymous auditions have never existed. A competitor review and user evaluation are needed before making novelty claims.

## Documentation

See docs/BLINDMATCH_PROJECT_SPEC.md for the HNDSE project problem statement, proposed architecture, data model, API plan, evaluation method and scope.

## Status

The interface and local demo interactions have been redesigned. A secure backend, persistent shared data, production media handling and formal testing remain future implementation work.
