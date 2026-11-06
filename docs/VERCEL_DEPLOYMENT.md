# Vercel setup (Hobby)
Two Vercel projects from this GitHub repository:
1. musiclink-api with rootDirectory server, framework Express.
2. musiclink-web with rootDirectory client, framework Vite.
Configure in musiclink-api: MONGO_URI, JWT_SECRET (long, unique, random), CLIENT_ORIGIN (exact public frontend URL).
Configure in musiclink-web: VITE_API_URL=https://YOUR-API.vercel.app/api
Re-deploy frontend after setting VITE_API_URL, and backend after changing CLIENT_ORIGIN.
The live MCCA implementation is in server/src/matcher.js. Python remains in recommender/main.py for research comparisons. Run npm test in server to verify matching logic.
Never commit a MongoDB password or JWT secret.
Atlas dynamic IP access must be configured separately, with least privileges possible. For a serverless egress with changing IPs, monitor and narrow access as the plan permits.
