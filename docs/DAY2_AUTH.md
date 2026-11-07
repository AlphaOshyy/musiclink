# Day 2: Authentication validation

## Security improvements
- Registration requires a password of at least 10 characters (maximum 128).
- Password confirmation happens in the browser; only the original password is submitted.
- Backend uses bcrypt (cost 12) and never returns password hashes.
- JWT is signed HS256, scoped to MusicLink issuer and web audience, expires after seven days.
- Protected endpoints reject missing or modified tokens; /api/me only returns the authenticated account.
- Login and registration responses have Cache-Control: no-store.
- Client only clears local sessions on authentication rejection, not temporary network failure.

## Tests
- GitHub Actions runs matcher tests, API syntax, frontend build, recommender tests and a public auth smoke test.
- The smoke test creates a randomly named temporary creator record. Remove test records matching `^ci-auth-` from the `musiclink.users` collection after a successful run.

## Remaining limitations
- The browser currently stores bearer tokens in localStorage. This remains vulnerable to token theft from cross-site scripting. A same-origin HttpOnly session-cookie architecture is recommended before unrestricted public recruitment.
- Express in-memory rate limiting is per serverless instance; it is not a durable multi-instance abuse-defense mechanism. Add centralized throttling and email verification before opening to arbitrary traffic.
- Successful CI API tests do not prove a complete browser interaction. Manual browser checks remain necessary.
