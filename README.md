# POiT

POiT is an emergent poetry web application — a daily ritual in three movements:

1. **Pulse** — gather 5–20 words from today's shared pool (the same words appear for every poet on the same day).
2. **Craft** — set your words on the page: arrange, punctuate, shape them into a poem.
3. **Echo** — wander a constellation of poems (yours, the community's, and seeded ones) connected through shared words.

Finished poems are kept in your **Poemlet** (`/poemlet`) and can be shared by link (`/poem/:id`). Liking a community poem stamps your jade **seal** on it.

## Design system — "Two Inks"

The interface follows a single rule borrowed from marked-up manuscripts and the collector's seal:

- Everything the **poet** makes — words, poems, titles — is set in **ink** (`Spectral` serif).
- Everything the **tool** says — buttons, labels, hints — is the collector's seal: **jade** (`Space Mono`).
- Surfaces are **paper** by day and **lampblack** by night.

Tokens live as CSS variables in `src/styles/index.css` (`--paper`, `--surface`, `--ink`, `--seal`) and are exposed to Tailwind in `tailwind.config.js` (`bg-paper`, `text-ink/60`, `border-seal/20`, …). All opacity-modified utilities adapt to dark mode automatically. The signature mark is the `Seal` component (`src/components/shared/Seal.jsx`).

## Project structure

- `src/` — React + Vite frontend.
- `server/` — Express API server (words, poems, prompts, seed poems, device auth).
- `api/` — Vercel serverless entrypoint that reuses the same Express app.

## Backend: Supabase (optional but recommended)

The API runs without any database (in-memory caches, no poem persistence). With Supabase configured you get durable daily words, community poems, likes, prompts, and seed poems.

### Setup from scratch

1. Create a Supabase project.
2. Open the SQL Editor and run:

```sql
-- Daily word sets, cached per timezone and day
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

-- AI-generated seed poems, one set per timezone and day
create table if not exists public.daily_seed_poems (
  timezone text not null,
  date_key text not null,
  poems jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  primary key (timezone, date_key)
);

-- AI-generated daily writing prompts
create table if not exists public.daily_prompts (
  timezone text not null,
  date_key text not null,
  prompt text not null,
  theme text,
  suggested_words jsonb not null default '[]'::jsonb,
  sparks jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  primary key (timezone, date_key)
);

-- Anonymous devices (fingerprint-based identity, JWT auth)
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  device_fingerprint text not null unique,
  display_name text not null default 'Anonymous Poet',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Poems saved from Craft mode
create table if not exists public.poems (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices (id) on delete set null,
  title text not null,
  components jsonb not null default '[]'::jsonb,
  selected_words jsonb not null default '[]'::jsonb,
  date_key text not null,
  is_public boolean not null default true,
  like_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_poems_public_created
  on public.poems (is_public, created_at desc);

-- Seals (likes) on poems, one per device per poem
create table if not exists public.poem_likes (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references public.poems (id) on delete cascade,
  device_id uuid not null references public.devices (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poem_id, device_id)
);

-- Like-count helpers used by POST /api/poems/:id/like
create or replace function public.increment_like_count(poem_id_input uuid)
returns void language sql as $$
  update public.poems set like_count = like_count + 1 where id = poem_id_input;
$$;

create or replace function public.decrement_like_count(poem_id_input uuid)
returns void language sql as $$
  update public.poems
  set like_count = greatest(like_count - 1, 0)
  where id = poem_id_input;
$$;
```

3. In Supabase Project Settings → API, copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## Environment variables

### Frontend (`.env`, all optional)

- `VITE_API_URL` — API base URL **including `/api`**. Defaults to the relative `/api`, which works with the Vite dev proxy and the Vercel rewrite — leave it unset unless the API lives on another origin.
- `VITE_USE_TEST_DATA` — `true` to use bundled test words offline.

### Backend (`server/.env` or deployment env)

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase credentials (optional; see above).
- `WORDNIK_API_KEY` — Wordnik key for daily/random words (falls back to a curated list without it).
- `GEMINI_API_KEY` — Google Gemini, used for word curation, seed poems, daily prompts.
- `OPENROUTER_API_KEY` — fallback LLM provider when Gemini is unavailable.
- `JWT_SECRET` — secret for device-auth tokens. **Set a real value in production.**
- `PORT` — server port (defaults to `5001`).

## Run locally

```bash
# backend
cd server && npm install && npm run dev

# frontend (separate terminal, repo root)
npm install && npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:5001`.

## Build

```bash
npm run build
```

## Deployment (Vercel)

`vercel.json` rewrites `/api/*` to the serverless function in `api/index.js` (which wraps the same Express app) and everything else to the SPA. Set the backend env vars in the Vercel project; the frontend needs none.

## API endpoints

- `GET  /api/words` — timezone-aware daily words.
- `POST /api/words/refresh` — force-refresh daily words.
- `GET  /api/words/define/:word` — short definition for a word.
- `GET  /api/poetry/poetsorg` — poem of the day with fallbacks.
- `GET  /api/seed-poems` — AI seed poems generated from today's word pool.
- `GET  /api/daily-prompt` — AI daily writing prompt, theme, and spark lines.
- `POST /api/poems/auth` — register/authenticate an anonymous device.
- `POST /api/poems` — save a poem (auth required).
- `GET  /api/poems/community` — public community poems.
- `GET  /api/poems/:id` — a single poem (for share links).
- `POST /api/poems/:id/like` — stamp/remove your seal (auth required).
