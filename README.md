# MangaVerse

A full-stack manga reading web app with a free tier and Pro subscription. Built with React 18, Express 4, Prisma 5, PostgreSQL, and Stripe.

## Features

- Browse and search 60 000+ manga via the MangaDex API
- Personal reading library with status tracking and progress sync
- Chapter reader with paged, vertical, and long-strip modes
- Bookmarks, ratings, comments
- Public user profiles with reading stats and charts
- Pro tier: premium manga access, offline downloads, ad-free, Pro badge
- Stripe subscription billing with webhook integration
- JWT auth with refresh-token rotation

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18 LTS |
| npm | 9 |
| PostgreSQL | 14 |

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mangaverse.git
cd mangaverse
```

### 2. Install dependencies

```bash
# Install root workspace deps (if any)
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 3. Create environment files

**Backend** — copy and fill in values:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mangaverse?schema=public"
JWT_SECRET=<output of: openssl rand -hex 32>
JWT_REFRESH_SECRET=<output of: openssl rand -hex 32>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # fill after Step 6
STRIPE_PRICE_ID=price_...         # fill after Step 5
SMTP_HOST=smtp.example.com
SMTP_USER=user@example.com
SMTP_PASS=...
EMAIL_FROM="MangaVerse <noreply@example.com>"
APP_URL=http://localhost:5173
```

**Frontend** — copy and optionally edit:

```bash
cp frontend/.env.example frontend/.env
# VITE_API_BASE_URL defaults to http://localhost:3001/api — no changes needed for local dev
```

### 4. Create the PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE mangaverse;"
```

### 5. Run Prisma migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

> **First time only.** On subsequent runs just `npx prisma migrate dev`.

### 6. Start development servers

Open two terminals:

```bash
# Terminal 1 — backend (port 3001)
cd backend && npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend && npm run dev
```

Open `http://localhost:5173`.

---

## Creating a Stripe Product and Price ID

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and log in (or create a free account).
2. Navigate to **Products** → **Add product**.
3. Set a name (e.g. "MangaVerse Pro") and description.
4. Under **Pricing**, choose **Recurring** → **Monthly** → enter `3.99` USD.
5. Click **Save product**.
6. On the product detail page, copy the **Price ID** (starts with `price_`).
7. Paste it into `backend/.env` as `STRIPE_PRICE_ID=price_...`.
8. Copy the **Stripe secret key** from **Developers → API keys** (use the `sk_test_` key for development).
9. Paste it as `STRIPE_SECRET_KEY=sk_test_...`.

---

## Setting Up Stripe Webhooks Locally (Stripe CLI)

The webhook receives events like `checkout.session.completed` and `customer.subscription.deleted` to update user subscription status.

### Install the Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
# Download the latest release from https://github.com/stripe/stripe-cli/releases
# and add it to your PATH
```

### Log in

```bash
stripe login
```

### Forward events to your local backend

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

The CLI will print a **webhook signing secret** (starts with `whsec_`). Copy it into `backend/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Restart the backend. Now Stripe events from the dashboard (or test triggers) will reach your local server.

### Test a checkout flow

```bash
# Trigger a successful checkout event manually
stripe trigger checkout.session.completed
```

---

## Switching from Test to Live Stripe Keys

When you're ready to go live:

1. In the Stripe dashboard, toggle the **Test mode** switch off (top-right corner).
2. Copy your **live secret key** (`sk_live_...`) from **Developers → API keys**.
3. Create a **live product and price** (same steps as above but in live mode). Copy the `price_live_...` ID.
4. Set up a **live webhook endpoint** in the Stripe dashboard:
   - Go to **Developers → Webhooks → Add endpoint**.
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the **Signing secret** (`whsec_live_...`).
5. Update `backend/.env` (or your production environment variables):

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
STRIPE_PRICE_ID=price_live_...
```

6. Restart the backend.

> **Never commit live keys to source control.** Use environment variable injection in your hosting platform (Railway, Render, Fly.io, etc.).

---

## Project Structure

```
mangaverse/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── src/
│   │   ├── config/              # App, DB, upload, premium manga list
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/          # Auth, rate limiting, error handler
│   │   ├── routes/              # Express routers
│   │   ├── services/            # MangaDex, Stripe, email, image proxy
│   │   └── utils/               # JWT helpers
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API wrappers
│   │   ├── components/          # Reusable UI and feature components
│   │   ├── constants/           # Premium manga IDs, preset avatars
│   │   ├── context/             # AuthContext
│   │   ├── hooks/               # useDebounce, useReaderSettings
│   │   ├── pages/               # Route-level page components
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # cn, mangadex helpers, imageProxy
│   └── .env.example
└── README.md
```

---

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with ts-node-dev (hot reload) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled output |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npx tsc --noEmit` | Type-check without building |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | TanStack Query v5, React Router v6 |
| Backend | Express 4, TypeScript, express-async-errors |
| Database | PostgreSQL + Prisma 5 |
| Auth | JWT (access 15m + refresh 7d with rotation) |
| Payments | Stripe v22 |
| Manga data | MangaDex API (rate-limited with p-queue) |
| File storage | Local disk (multer) — swap for S3 in production |
