# ContractorBook — Backend & Learning Plan Handoff

## App
Android app for a civil contractor managing 5-8 sites, 20-30 workers, 3-5 users initially. UI designs: `Contractor App.dc.html` (see design_handoff_contractor_app/ for full UI spec). Working name: **ContractorBook**.

## Chosen stack
- **Frontend**: React Native (Android first)
- **Backend**: Python + FastAPI (chosen deliberately as a way to learn Python by building this app)
- **Database/Auth**: Supabase (Postgres, free tier)
- **API hosting**: Render (free tier)

## Why this stack
- FastAPI is a good first Python framework — teaches routing, request/response models (Pydantic), async basics — while staying simple enough to build real endpoints quickly.
- Supabase gives a production Postgres DB + auth without needing to learn database ops up front.
- Both have free tiers sufficient for 3-5 users, so the whole build-and-learn phase costs $0.

## Cost reality at this scale (3-5 users)
- **Supabase free tier**: DB pauses after 1 week of *zero* activity; any request auto-wakes it (few seconds). Not an issue with regular daily use.
- **Render free tier**: spins down after ~15 min idle; first request after an idle gap takes 20-50s (cold start) while it spins back up, then fast until the next idle gap. User confirmed this tradeoff is acceptable.
- **Net cost while learning / at this scale: $0/month.**
- If it later needs to feel instant with zero cold starts: Render Starter (~$7/mo) removes the sleep; Supabase Pro ($25/mo) removes the DB pause and adds backups — upgrade only once daily reliance justifies it.
- Play Store publishing: one-time $25 developer fee (separate from hosting).

## Suggested next steps (in order)
1. **Data model** — design Postgres tables in Supabase: `workers`, `sites`, `attendance` (worker_id, site_id, date, status: absent/half/full/savai/dedhi), `payments` (worker_id, amount, type: advance/salary/extra, paid_from: cash/bank), `expenses` (site_id, amount, description, paid_by, paid_from), `clients`/`bills` if billing is in scope.
2. **FastAPI project skeleton** — endpoints per screen already designed:
   - `GET /dashboard` — cash/bank totals, today's attendance progress, site P&L
   - `GET /workers`, `POST /attendance` — mark attendance (supports multi-site split per worker per day)
   - `POST /payments` — record advance/salary/extra work payment
   - `POST /expenses` — record site expense
3. **Connect FastAPI to Supabase Postgres** using its connection string + `sqlalchemy`/`asyncpg`, or call Supabase's REST/PostgREST API directly.
4. **Deploy FastAPI to Render free tier**; point React Native app at the Render URL.
5. **Auth**: Supabase Auth (email/phone OTP) for the 3-5 users — skip building custom auth.
6. **Wire React Native screens** to the design specs in `design_handoff_contractor_app/README.md`.

## Reference files in this project
- `Contractor App.dc.html` — high-fidelity UI, 5 screens + 2 alternate color themes.
- `design_handoff_contractor_app/README.md` — full screen-by-screen spec, design tokens, copy, for recreating the UI natively.
- `design_handoff_contractor_app/BRD - Civil Contractor Management Application V2.pdf` — original requirements.

## Open items to decide later
- Final theme choice (Original forest green, Slate & amber, or Terracotta & charcoal).
- Whether client billing / cash & bank ledger / worker & site list screens (in BRD, not yet designed) are needed for v1.
- Offline support strategy (workers/supervisors may be on-site with poor connectivity) — likely needs local caching + sync, worth scoping before backend schema is finalized.
