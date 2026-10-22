# SmartNest — Smart Living, Simplified.

A smart-home planning and guidance platform: learn, organise your home and devices, plan purchases, and get help through SmartNest Care.

> **Build status:** Phase 1 (accounts + guides) is complete. Phases 2–6 are in progress; this README is updated as each lands. See [Roadmap](#roadmap).

SmartNest is a student project. It **does not control or read live status from any device**, its planner (when it lands) is **rule-based, not AI**, and any product details or prices it shows are **sample data**. See [What is real and what is simulated](#what-is-real-and-what-is-simulated).

## Architecture

```
 Browser ──HTTPS──▶ Vercel (static React app)
    │                     │  built with VITE_API_URL
    └──HTTPS + CORS──────▶ Render Web Service (Node + Express)  ──▶ Render PostgreSQL
                              │ every request: authenticate → authorise → validate → query
                              └ access control lives here, in code, not in the browser
```

- **Frontend** (`/`): React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query. Deployed to **Vercel**.
- **Backend** (`/server`): Node 22, Express 5, TypeScript, `pg`, `zod`. Deployed to **Render** as a Web Service. Applies SQL migrations on boot.
- **Database**: PostgreSQL on **Render**.
- **Access control**: opaque bearer sessions (only a SHA-256 hash is stored); roles (`customer` / `admin`) are checked in server code on every request. No endpoint can write `users.role`.

## Repository layout

```
.
├── src/                    Frontend
│   ├── components/         Layout, route guards, UI kit, toasts
│   ├── pages/              Home, auth pages, dashboard, status
│   ├── learn/              Guide loader, search, reader pages (+ tests)
│   ├── content/guides/     The guide library: Markdown, one folder per topic
│   └── lib/                API client, auth context, validation, forms
├── server/                 Backend (its own package.json)
│   ├── migrations/         Numbered SQL files, applied automatically on boot
│   ├── src/                config, db, auth, routes, app factory, entrypoint
│   └── test/               Integration tests against a real Postgres
├── e2e/                    Playwright end-to-end tests (local or against the live deploy)
├── vercel.json             SPA rewrite + security headers + Content-Security-Policy
└── playwright.config.ts
```

## Run it locally

Prerequisites: Node 22, a local PostgreSQL 14+.

```bash
# 1. database
createdb smartnest_dev

# 2. backend
cd server
cp .env.example .env          # edit DATABASE_URL if yours differs
npm install
npm run dev                   # http://localhost:4000, migrations run on boot

# 3. frontend (new terminal, repo root)
npm install
npm run dev                   # http://localhost:5173, /api is proxied to :4000
```

Leave `VITE_API_URL` empty locally; the Vite dev server proxies `/api` to the backend.

To create the first admin locally, set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` in `server/.env` and restart.

## Environment variables

### Backend (Render → your Web Service → Environment)

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | **Yes** | The Render Postgres **Internal Database URL**. |
| `CORS_ORIGINS` | **Yes** | Your Vercel URL, e.g. `https://smartnest.vercel.app`. Comma-separate several. No trailing slash. |
| `APP_URL` | **Yes** | Your Vercel URL; used to build password-reset links. |
| `NODE_ENV` | Recommended | `production` |
| `NODE_VERSION` | Recommended | `22` (Render build setting) |
| `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` | To create the admin | Creates that admin on boot if the email is unused. **Never** promotes an existing account. Remove the password after first sign-in. |
| `RESEND_API_KEY` + `MAIL_FROM` | Optional | Real password-reset email via Resend's HTTP API. Without them **no email is sent** (the UI says so). |
| `MAIL_LOG_LINKS` | Optional | `true` prints reset links in the server log instead (demo only). |
| `DATABASE_SSL`, `SESSION_TTL_DAYS`, `RESET_TOKEN_TTL_MINUTES` | Optional | See `server/.env.example`. |

`PORT` is set by Render itself; the server binds `0.0.0.0:$PORT`. A missing required variable stops the server at boot with a message naming it.

### Frontend (Vercel → Project → Settings → Environment Variables)

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | **Yes** | The Render service URL, e.g. `https://smartnest-api.onrender.com`. No trailing slash. Baked in at build time, so redeploy after changing it. |

Nothing secret belongs in a `VITE_` variable: it ships in the public JavaScript.

## Deploy

### Render — backend

Create a **Web Service** from this repository:

| Setting | Value |
| --- | --- |
| Branch | the branch you deploy from |
| **Root Directory** | `server` |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Create a Render **PostgreSQL** instance in the same region and copy its *Internal Database URL* into `DATABASE_URL`.

### Vercel — frontend

Import the repository. Framework preset **Vite**, root directory = repository root (default), build `npm run build`, output `dist`. Set `VITE_API_URL`, then redeploy. `vercel.json` provides the SPA rewrite, security headers and CSP. Its `connect-src` allows `https://*.onrender.com`; if you use a custom API domain, add it there.

### After the first deploy

1. Open `https://<your-vercel-url>/status`. It makes a real request from your browser to the backend and reports the round trip and database status.
2. Set the backend's `CORS_ORIGINS` and `APP_URL` to the Vercel URL, if you have not already.
3. Create an account at `/signup`; sign out and back in; refresh a deep link such as `/learn/smart-locks`.

> **Free-tier behaviour:** Render's free web services sleep when idle, so the first request can take up to a minute (the UI shows a "waking up" banner). Render's free Postgres instances expire after a limited period. Check both before a demo.

## Tests

```bash
npm test                 # frontend: unit + component tests (49)
npm run lint && npm run typecheck

cd server && npm test    # backend integration tests, need a local Postgres (see TEST_DATABASE_URL)

npm run e2e              # full browser run: builds both apps, starts them, drives Chromium
E2E_BASE_URL=https://your-app.vercel.app npm run e2e:live   # same checks against the live site
```

`server/test` expects a database reachable at `TEST_DATABASE_URL` (default `postgres://smartnest:smartnest@localhost:5432/smartnest_test`). It truncates tables between tests, so never point it at real data. For the e2e run, set `CHROMIUM_PATH` if your machine has no Playwright browser installed.

## What is real and what is simulated

| Real | Not real |
| --- | --- |
| Accounts, sessions, password hashing, reset tokens, rate limiting | Control of, or live status from, any device |
| Server-enforced roles and data ownership | AI. SmartNest's planner is rule-based logic you can read |
| The guide library and its search | Payments, technicians, bookings, partnerships |
| Everything on the `/status` page | Email delivery, unless `RESEND_API_KEY` is configured |

## Known limitations (Phase 1)

- **No email verification** at signup. Anyone can register any address they like.
- **Bearer tokens in `localStorage`**: simple and works across Vercel/Render origins, but readable by any script that runs on the page. Mitigations: a strict CSP, no `dangerouslySetInnerHTML`, server-side revocation on logout and password reset.
- **Password reset email needs a provider** (Resend). Render's free tier blocks SMTP.
- **`npm audit`** reports a moderate issue in `postcss-selector-parser` through `@tailwindcss/typography`. It runs only at build time on our own CSS, so it is not reachable in production; npm's suggested fix is a downgrade, which we have not taken.
- Rate limiting is in-memory, which is correct for one instance but not shared across several.

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Accounts, protected routes, persistent sessions, guide library with search | **Done** |
| 2 | Dashboard, homes → rooms → devices, seeded sample catalogue | Next |
| 3 | SmartNest Care tickets, photo upload, admin dashboard | Planned |
| 4 | Rule-based planner and saved plans | Planned |
| 5 | Device passport, in-app reminders, polish | Planned |
| 6 | Security tests, demo data, demo script | Planned |
