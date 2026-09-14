# ContractorBook

Android app for a civil contractor to manage worker attendance, pay, site expenses, client bills, and cash/bank balances across multiple sites.

## Structure

- `app/` — React Native (Expo, TypeScript) mobile app, Android-first.
- `backend/` — FastAPI backend, backed by Supabase Postgres, deployed to Render.
- `docs/` — original requirements (BRD) and UI design handoff.

## Requirements & design

- `docs/BRD - Civil Contractor Management Application V2.pdf` — full functional requirements.
- `docs/design-handoff.md` — screen-by-screen UI spec and design tokens (colors, type, spacing) for the 5 designed screens.
- `docs/Contractor App.dc.html` — high-fidelity visual reference for those screens (open in a browser).

## Running locally

### Backend
```
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in Supabase connection string + JWT secret
uvicorn app.main:app --reload
```
API docs available at `http://localhost:8000/docs`.

### App
```
cd app
npm install
cp .env.example .env   # fill in EXPO_PUBLIC_API_URL + Supabase URL/anon key
npx expo start
```
