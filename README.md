# AskLoom

AskLoom is an AnswerThePublic-style research SaaS for content creators. It pulls
Google and YouTube autocomplete data, clusters ideas into question-style groups,
renders a D3 radial search cloud, and can turn results into short video hooks
with Gemini.

Payments use Flutterwave. Paid plans are stored in Postgres and priced in USD.

## Stack

- Frontend: React, Vite, TypeScript, D3
- Backend: Express, TypeScript, Prisma, Postgres
- Auth: short-lived JWT access tokens plus HTTP-only refresh-session cookies
- Payments: Flutterwave checkout, redirect verification, and authoritative webhook processing

## Local Setup

Start Postgres:

```bash
docker compose up -d postgres
```

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/health`
- API base: `http://localhost:4000/api`
- Payment callback: `http://localhost:5173/payment/callback`

## Required Environment

Backend:

- `NODE_ENV`
- `PORT`
- `FRONTEND_URL`
- `DATABASE_URL`
- `JWT_SECRET`
- `FLW_PUBLIC_KEY`
- `FLW_SECRET_KEY`
- `FLW_SECRET_HASH`
- `FLW_REDIRECT_URL`
- `GEMINI_API_KEY`

Frontend:

- `VITE_API_BASE`

Do not commit real `.env` files.

## Flutterwave Flow

1. Frontend calls `POST /api/payment/initialize` with a plan code.
2. Backend looks up the plan from the database and creates a pending transaction.
3. Backend calls Flutterwave and returns the hosted checkout URL.
4. Flutterwave redirects the user to `/payment/callback`.
5. The callback page calls `GET /api/payment/verify/:transactionId` for fast UX feedback.
6. Flutterwave also calls `POST /api/payment/webhook`.
7. Server-side verification checks status, amount, currency, and transaction reference before activating a subscription.

The frontend never decides whether a user is paid.

## Production Notes

The backend Docker image runs:

```bash
npm run start:migrate
```

That applies committed Prisma migrations with `prisma migrate deploy`, then starts
the compiled API. Use `render.yaml` as the baseline Render deployment blueprint.

Before live payments:

- Use Flutterwave live keys.
- Set `FLW_REDIRECT_URL` to the deployed frontend callback URL.
- Configure the Flutterwave webhook URL as `https://your-api-domain/api/payment/webhook`.
- Set the same webhook secret hash in Flutterwave and `FLW_SECRET_HASH`.

## Verification

```bash
cd backend
npm run build
npm test

cd ../frontend
npm run build
```

## Current Gaps

- Production email delivery is not wired yet; email verification and password reset expose tokens only in non-production.
- Webhook retry is admin-triggered, not a background worker queue.
- Admin tools are intentionally small and should grow with operational needs.
- Audit findings from npm remain to be triaged.
