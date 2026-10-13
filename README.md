# Daftar — Personal Finance Dashboard

[فارسی](README.fa.md)

A personal finance ledger built for Persian users: income, expenses and monthly budgets with the Jalali (Shamsi) calendar, Persian digits, RTL layout and light/dark themes.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Recharts · FastAPI · SQLAlchemy 2 · JWT · SQLite / PostgreSQL

## Features

- Public landing page with an animated ledger preview, features, how-it-works steps and FAQ
- Animated login and sign-up pages with password strength meter and show/hide password
- JWT authentication; every new user gets a default set of categories
- Create, edit and delete transactions, filtered by type, category and note search
- Monthly budget per expense category with a progress bar and warnings from 80%
- Recurring transactions (rent, instalments, ...) generated automatically on a chosen day each month
- Charts: spending share by category, six-month trend, daily spending
- Full Jalali calendar support (date picker, monthly grouping, leap years)
- CSV export for Excel, print / save as PDF
- Monochrome black-and-white design with dark and light themes, RTL, Vazirmatn font

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

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

On Windows PowerShell activate the environment with `.venv\Scripts\Activate.ps1`.

API docs: http://localhost:8000/docs

The backend does not load `.env` automatically. Export the variables in your shell, or start uvicorn with `--env-file .env`.

For PostgreSQL set `DATABASE_URL` to something like `postgresql://user:pass@localhost:5432/finance`.

### Frontend

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

## Environment variables

| Variable               | Where    | Description                                           |
| ---------------------- | -------- | ----------------------------------------------------- |
| `SECRET_KEY`           | backend  | JWT signing key. Change it in any real deployment     |
| `DATABASE_URL`         | backend  | Defaults to a local SQLite file                       |
| `FRONTEND_ORIGIN`      | backend  | Allowed CORS origin(s), comma-separated               |
| `TOKEN_EXPIRE_MINUTES` | backend  | Defaults to 7 days                                    |
| `NEXT_PUBLIC_API_URL`  | frontend | Backend base URL, defaults to `http://localhost:8000` |

## Project structure

```
backend/app
  main.py  models.py  schemas.py  auth.py  services.py  jalali.py  database.py
  routers/  auth  categories  transactions  budgets  recurring  reports
frontend
  app/page.tsx          landing page
  app/login, register   authentication pages
  app/(app)/            dashboard, transactions, budgets, recurring, categories
  components/           AuthScreen, LedgerPreview, LandingNav, Modal, ...
  lib/                  api client, Jalali helpers, formatting, types
```

## Design notes

- Amounts are stored as integers (Toman) to avoid floating-point errors in totals.
- The Jalali conversion is implemented independently in Python (`jalali.py`) and TypeScript (`lib/jalali.ts`), so month boundaries match on both sides.
- Direction is set explicitly with `dir="rtl"` on the page roots, email and password inputs stay LTR, and signed numbers use the `.num` class so minus and plus signs never flip.
- The page always reserves scrollbar space (`overflow-y: scroll` on `html`) so the header does not shift between short and long pages.
- Animations respect `prefers-reduced-motion`.
