# MusicLink Day 1: cloud deployment checklist

**Goal:** Public frontend with a reachable Node API, Python recommender and persistent cloud MongoDB database.

## 1. Database: MongoDB Atlas
1. Create an Atlas project and an M0 Free cluster.
2. Create a dedicated database user with read/write permissions to the MusicLink database.
3. Allow only the IP addresses needed by the API if static egress is available. A dynamic outbound host might require a wider temporary Atlas access rule; do not assume it is secure. Review this before public release.
4. Copy the SRV URI into Render's encrypted MONGO_URI environment variable. Never commit it.
5. Use the database name `musiclink` in the URI.

## 2. Deploy the services: Render
1. Connect your GitHub repository `AlphaOshyy/musiclink` to Render.
2. Use the repository's `render.yaml` Blueprint to create `musiclink-api` and `musiclink-recommender`.
3. Choose the Free plans; do not enable paid upgrades without reviewing the price.
4. Set `MONGO_URI` on the API service.
5. Set `CLIENT_ORIGIN` to the exact frontend origin, without a trailing slash. Example: `https://musiclink.pages.dev`. Replace with the real assigned URL.
6. Set `RECOMMENDER_URL` to the real HTTPS URL of the deployed Python service. Example: `https://musiclink-recommender.onrender.com`. Replace if the assigned hostname differs.
7. Let `JWT_SECRET` use the generated secure random value.
8. Verify `https://YOUR-API.onrender.com/api/health` returns JSON with `ok: true`.
9. Verify `https://YOUR-RECOMMENDER.onrender.com/health` returns JSON with `ok: true`.

**Note:** The API's health route verifies the API process, not live database connectivity or the recommender. Use registration and recommendations for integration testing.

## 3. Deploy frontend: Cloudflare Pages
1. Create a Pages project connected to the same GitHub repository.
2. Select `client` as root directory.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Build output directory: `dist`, relative to the client root.
6. Add build-time variable `VITE_API_URL=https://YOUR-API.onrender.com/api`.
7. Deploy and obtain the actual `*.pages.dev` URL.
8. Copy that precise origin into Render `CLIENT_ORIGIN`. Redeploy the API after updating.

## 4. End-to-end smoke test
1. Open the live frontend in an incognito browser window.
2. Register Creator A and Creator B with separate emails.
3. Add preferences and genres to both accounts.
4. Publish a test project from Creator A.
5. Confirm Creator B sees and applies to the project.
6. Sign in as Creator A and generate recommendations.
7. Verify factor scores, explanations and RCC values appear.
8. Confirm blind mode does not return candidate names, email, popularity figures or portfolio URLs.
9. Shortlist and reveal candidate identity.
10. Invite Creator B and accept using their account.

## Security and limitations
- The existing app stores its bearer token in localStorage, which carries XSS risk. Harden authorization/session handling before unrestricted public recruitment.
- Do not collect real participant data until consent, retention and deletion requirements are implemented.
- Blind review currently represents a research interface, not a formal anonymization guarantee. Creator details remain available through other normal views, so it must not be represented as fully anonymous.
- The production deployment cannot be considered complete without real URLs and live smoke-test results.
- Free web services sleep and their capacities are limited. Deployment availability is not guaranteed.
- Current two Render services might exceed shared free compute limits if both are always active. Monitor quotas and plan fallback within LKR 5,000.
