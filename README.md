# MusicLink

MusicLink is a research-focused web application for connecting independent music creators through explainable, reciprocal recommendations.

## Project stack
- React + Vite web client
- Node.js + Express REST API
- MongoDB + Mongoose
- Python + FastAPI recommendation service

## Setup

Prerequisites: Node.js 20+, Python 3.11+, MongoDB running locally.

### Terminal 1: recommendation service
```bash
cd recommender
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Terminal 2: API
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Terminal 3: frontend
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 . API: http://localhost:4000/api/health . Recommender: http://localhost:8000/health .

Never commit secrets. Change JWT_SECRET in server/.env. Use MongoDB locally or a private MongoDB Atlas database.

## Research features
MCCA: M(A,B) = 0.20G + 0.25S + 0.25C + 0.20P + 0.10Av.
RCC: sqrt(M(A,B) * M(B,A)).
Factors are normalized to 0..100. Weights are initial assumptions, not validated outcomes.

Blind review excludes direct identifiers and popularity fields at API level. Identity reveal is permitted for shortlisted candidates and the project owner only. No promise is made that portfolio URLs or creative metadata are inherently anonymous; use anonymized samples for controlled studies.

This is the new implementation. The previous static prototype is preserved on the backup-pre-rebuild-2026-11-06 branch.

## Current phase
Core application skeleton with registration/login, creator profiles, portfolio entries, project management, applications, invitations, recommendations, and blind review. Local integration, end-to-end tests, production deployment, research data collection, and hardening remain to be completed.
