# Daftar (دفتر) — Personal Finance Dashboard

[فارسی](README.fa.md)

A personal finance ledger built for Persian users: income, expenses and monthly budgets with the Jalali (Shamsi) calendar, Persian digits, RTL layout and light/dark themes.

**Live demo:** https://YOUR-APP.workers.dev
Open it and press **"ورود به نسخه‌ی نمایشی"** (Enter demo). No sign-up needed.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Recharts · FastAPI · SQLAlchemy 2 · JWT · SQLite / PostgreSQL

## Two ways to run it

| Mode          | What it needs                         | Where data lives                           | Used for                 |
| ------------- | ------------------------------------- | ------------------------------------------ | ------------------------ |
| **Demo mode** | Frontend only                         | The visitor's own browser (`localStorage`) | The public live demo     |
| **Full mode** | Frontend + FastAPI backend + database | SQLite or PostgreSQL                       | Real use and development |

Demo mode is switched on by `NEXT_PUBLIC_DEMO=1`. When it is on, the frontend does not call any server. A small in-browser API (`frontend/lib/demo.ts`) answers every request the app makes, so all pages behave as they do against the real backend.

## Features

- Public landing page with an animated ledger preview, features, how-it-works steps and FAQ
- Animated login and sign-up pages with a password strength meter and show/hide password
- JWT authentication; every new user gets a default set of categories (full mode)
- Create, edit and delete transactions, filtered by type, category and note search
- Monthly budget per expense category with a progress bar and warnings from 80%
- Recurring transactions (rent, instalments, ...) generated automatically on a chosen day each month
- Charts: spending share by category, six-month trend, daily spending
- Full Jalali calendar support (date picker, monthly grouping, leap years)
- CSV export for Excel, print / save as PDF
- Monochrome black-and-white design with dark and light themes, RTL, Vazirmatn font
- Responsive layout, checked at 360 px and 768 px widths with no horizontal scroll

## What the demo contains

- A ready account with six months of income and expenses, budgets for several categories and three recurring items, all dated relative to today's Jalali month
- Every page is fully usable: add, edit and delete transactions and categories, set budgets, add recurring rules, filter, search and export CSV
- Any email and password works on the login and sign-up pages, or use the **"ورود با حساب آزمایشی"** button
- Changes are saved only in the visitor's browser and are never sent anywhere. Other visitors never see them
- A banner at the top explains this and has a **"بازنشانی داده‌ها"** (reset data) button
- In demo mode, a new recurring rule also creates this month's transaction right away if its day has already passed. The real backend generates recurring transactions on the server instead

## Routes

| Path                  | Page                         |
| --------------------- | ---------------------------- |
| `/`                   | Landing page                 |
| `/login`, `/register` | Authentication               |
| `/dashboard`          | Monthly overview and charts  |
| `/transactions`       | Transactions list and editor |
| `/budgets`            | Monthly budgets              |
| `/recurring`          | Recurring transactions       |
| `/categories`         | Categories                   |

## Getting started

Requirements: Node.js 18+ for the frontend, Python 3.10+ for the backend (full mode only).

### Demo mode (frontend only)

```bash
cd frontend
npm install
npm run build
npx serve@latest out
```

The build exports static files into `frontend/out`, so `npm run start` does not work in demo mode. `npx serve@latest out` serves them locally (it prints the address, usually http://localhost:3000).

The demo flag is read from `frontend/.env.production`, which contains:

```
NEXT_PUBLIC_DEMO=1
```

`npm run dev` does not read `.env.production`, so it runs in full mode. To try the demo in development, create `frontend/.env.local` with `NEXT_PUBLIC_DEMO=1` and restart the dev server.

### Full mode (frontend + backend)

Backend:

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

A virtual environment is recommended but optional. On Windows PowerShell, activate one with `.venv\Scripts\Activate.ps1`.

API docs: http://localhost:8000/docs

The backend does not load `.env` automatically. Set the variables in your shell. In PowerShell:

```powershell
$env:SECRET_KEY = "a-long-random-string"
$env:DATABASE_URL = "sqlite:///./finance.db"
```

Frontend, in a second terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App: http://localhost:3000

If styles or layout look stale after pulling changes, clear the cache and restart:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

### PostgreSQL

Set `DATABASE_URL` to something like `postgresql://user:pass@host:5432/dbname`. A `postgres://` prefix is converted automatically. Tables are created on startup.

### Optional: a demo user in the real database

`backend/seed_demo.py` creates `demo@example.com` with sample data in whatever database `DATABASE_URL` points to. Running it again resets that user's data:

```bash
cd backend
python seed_demo.py
```

Change the account with the `DEMO_EMAIL`, `DEMO_PASSWORD` and `DEMO_NAME` variables. This is only for full mode. The public demo does not use it.

## Deploying the demo on Cloudflare

The demo needs no backend or database. With `NEXT_PUBLIC_DEMO=1`, `next build` exports the whole app as static files into `frontend/out`, and Cloudflare Workers serves them as static assets (configured in `frontend/wrangler.jsonc`).

Deploy straight from GitHub with Workers Builds:

1. Push the repository to GitHub.
2. In the Cloudflare dashboard open **Workers & Pages**, then **Create application**, then **Import a repository**, and pick the repository.
3. Use these settings:
    - Project / Worker name: `finance-dashboard` (it must match `name` in `wrangler.jsonc`)
    - Root directory: `frontend`
    - Build command: `npm install && npm run build`
    - Deploy command: `npx wrangler deploy`
4. Save and deploy. The app is then served at `https://finance-dashboard.<your-subdomain>.workers.dev`. Every push to the main branch redeploys it.

To deploy from your own computer instead, run `npm run build` and `npx wrangler deploy` inside `frontend`.

The OpenNext adapter is not used, because the demo is fully static and the latest adapter versions require a newer Next.js than the 14.x used here. Replace `YOUR-APP.workers.dev` at the top of this file with the real address.

To deploy the full version instead, host the FastAPI backend on a service that runs Python (for example Render) with a PostgreSQL database, remove `NEXT_PUBLIC_DEMO` and set `NEXT_PUBLIC_API_URL` to the backend address before building. Without demo mode the app is not exported statically, so it needs a Node-capable host.

## Environment variables

| Variable               | Where    | Description                                                        |
| ---------------------- | -------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_DEMO`     | frontend | `1` turns on demo mode, with no backend. Set in `.env.production`  |
| `NEXT_PUBLIC_API_URL`  | frontend | Backend base URL in full mode, defaults to `http://localhost:8000` |
| `SECRET_KEY`           | backend  | JWT signing key. Use a long random value in any real deployment    |
| `DATABASE_URL`         | backend  | Defaults to a local SQLite file                                    |
| `FRONTEND_ORIGIN`      | backend  | Allowed CORS origin(s), comma-separated                            |
| `TOKEN_EXPIRE_MINUTES` | backend  | Defaults to 7 days                                                 |

`NEXT_PUBLIC_*` variables are baked into the frontend at build time and are visible in the browser, so never put secrets in them. Keep real `.env` files out of Git. The `.gitignore` already excludes them and keeps only the `*.example` templates and `.env.production`.

## Project structure

```
backend
  seed_demo.py          optional demo user for a real database
  app/
    main.py  models.py  schemas.py  auth.py  services.py  jalali.py  database.py
    routers/            auth  categories  transactions  budgets  recurring  reports
frontend
  wrangler.jsonc        Cloudflare Workers static-assets config
  next.config.mjs       enables static export in demo mode
  app/page.tsx          landing page
  app/login, register   authentication pages
  app/(app)/            dashboard, transactions, budgets, recurring, categories
  components/           AuthScreen, LedgerPreview, LandingNav, HeroActions, Modal, ...
  lib/                  api client, in-browser demo API, Jalali helpers, formatting, types
```

## Design notes

- Amounts are stored as integers (Toman) to avoid floating-point errors in totals.
- The Jalali conversion is implemented independently in Python (`jalali.py`) and TypeScript (`lib/jalali.ts`), so month boundaries match on both sides.
- `lib/api.ts` is the only place that talks to the network. In demo mode it routes every call to `lib/demo.ts`, which mirrors the backend's endpoints, validation messages and response shapes.
- Direction is set explicitly with `dir="rtl"` on the page roots. Email and password inputs stay LTR, and signed numbers use the `.num` class so minus and plus signs never flip.
- The page always reserves scrollbar space (`overflow-y: scroll` on `html`) so the header does not shift between short and long pages.
- Animations respect `prefers-reduced-motion`.

## Notes

- Demo data lives in the browser's `localStorage`. Clearing site data or using a private window starts fresh from the sample data.
- Full mode has no email verification and no password reset. It is a portfolio project, not a hardened product.
