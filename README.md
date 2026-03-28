# POiT Prototype

POiT is an emergent poetry web application for free-form creation, self-exploration, and interpersonal communication through a network of poetry.

## Project structure

- `src/` — React + Vite frontend.
- `server/` — Express API server (daily words + poem endpoint).
- `api/` — Serverless entrypoint that reuses the same Express app.

## Backend pivot: Supabase (no MongoDB required)

The daily words cache now supports:
1. **Supabase Postgres** (recommended in production)
2. In-memory fallback (works without any external database)

If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are missing, the API still runs with in-memory cache only.

## Supabase setup from scratch

1. Create a Supabase project.
2. Open SQL Editor and run:

```sql
create table if not exists public.daily_word_sets (
  timezone text not null,
  date_key text not null,
  words jsonb not null default '[]'::jsonb,
  refreshed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (timezone, date_key)
);

create index if not exists idx_daily_word_sets_refreshed_at
  on public.daily_word_sets (refreshed_at desc);
```

3. In Supabase Project Settings → API, copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## Environment variables

### Frontend (`.env`)

- `VITE_API_BASE_URL` — API base URL (example: `http://localhost:5001`).
- `VITE_USE_TEST_DATA` — optional (`true`/`false`), defaults to `false`.

### Backend (`server/.env` or deployment env)

- `SUPABASE_URL` — Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key.
- `WORDNIK_API_KEY` — Wordnik API key for daily/random words.
- `PORT` — optional server port (defaults to `5001`).

## Run locally

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

## Build

```bash
npm run build
```

## API endpoints

- `GET /api/words` — returns timezone-aware daily words.
- `POST /api/words/refresh` — force-refresh daily words.
- `GET /api/poetry/poetsorg` — poem of the day with fallback behavior.
