# MusicLink

MusicLink is a research prototype for discovering independent musicians and coordinating music collaborations. The current application includes a React/Vite frontend, Node/Express REST API, MongoDB storage and a deterministic reciprocal MCCA ranking implementation. The separate Python recommendation prototype remains in the repository for research/testing.

## Live application
- Frontend: https://musiclink-web.vercel.app
- Backend health: https://musiclink-api.vercel.app/api/health
- Database health: https://musiclink-api.vercel.app/api/health/db

## Delivered capabilities
1. Registration, authentication, creator portfolios and project listings.
2. Search, project applications, creator preferences and explainable MCCA scoring.
3. Blind/visible shortlisting, invitation review, approval and response status.
4. Artist verification requests with manually reviewed website/channel proof codes.
5. Authenticated MP3/WAV uploads, native audio playback, owner-only deletion.
6. Experimental browser signal analysis: BPM, estimated musical key, energy, style/mood hints, vocal pitch range and pitch variability.
7. Optional confidence-weighted acoustic features in MCCA, capped at 12%; missing clips do not reduce scores.
8. On-demand Three.js frequency visualizer during real audio playback, with native media controls and reduced-motion behavior.

## Start locally
Requires Node.js 22+, Python 3.11+ for optional Python prototype, and MongoDB.

API:
```bash
cd server
cp .env.example .env
npm install
npm test
npm run dev
```
Configure MONGO_URI, CLIENT_ORIGIN and a strong JWT_SECRET in server/.env. Never commit secrets.

Client:
```bash
cd client
npm install
npm run build
npm run dev
```
Configure VITE_API_URL to the backend API base URL where required. Open http://localhost:5173.

Optional Python prototype:
```bash
cd recommender
pip install -r requirements.txt
pytest -q
uvicorn main:app --reload --port 8000
```

## Evaluation and tests
```bash
cd server
npm test
node scripts/evaluate-final.mjs
cd ../client
npm run build
node --test src/media.test.js src/musicAnalysis.test.js src/vocalAnalysis.test.js src/listeningRoomMath.test.js
cd ../recommender
pytest -q
```
Synthetic benchmark labels are illustrative, not observed musician outcomes. See [Final Handover](docs/FINAL_HANDOVER.md) and [Evaluation Protocol](docs/FINAL_EVALUATION.md).

## Academic and technical limitations
MCCA is a weighted heuristic, not a machine-learned or scientifically validated compatibility predictor. Audio metadata comes from clients and is not cryptographically attested. BPM, key and vocal pitch estimates have not been evaluated against annotated field recordings. Artist verification checks control of a page or channel, not legal identity. Three.js requires capable browsers. Production adoption requires accessibility, user acceptance, privacy and security reviews.

## Previous prototype
The earlier static prototype is preserved in branch `backup-pre-rebuild-2026-11-06`.
