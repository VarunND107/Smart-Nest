# SmartNest — Smart Living, Simplified.

A smart-home planning and guidance platform: learn, plan, manage your devices, and get help through SmartNest Care.

> **Status: Step 0 (pipeline check).** This commit is a minimal "hello world" used to prove
> GitHub → Netlify → Supabase end to end. Features are built phase by phase after that;
> this README is expanded as they land.

## Stack

React 19 + TypeScript, Vite, Tailwind CSS v4, Supabase (Postgres, Auth, Storage, Row Level Security), Netlify.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the two VITE_SUPABASE_* values
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run lint` | oxlint |
| `npm run preview` | Serve the production build locally |

## Environment variables

| Name | Where | Secret? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `.env.local`, Netlify site env vars | No (public by design) |
| `VITE_SUPABASE_ANON_KEY` | `.env.local`, Netlify site env vars | No (public by design; RLS protects data) |

The Supabase **service-role key** and **access token** never go in this repo, in `VITE_*` variables or in Netlify site env vars.

## Deploy

Netlify builds on every push to the production branch (`netlify.toml`: `npm run build`, publish `dist`, SPA fallback redirect).
