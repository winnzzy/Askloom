# AskLoom

An AnswerThePublic-style content-question research tool, built for creators:
pulls Google + YouTube autocomplete data for a seed keyword, clusters it into
questions/comparisons/prepositions/alphabeticals, renders it as a radial
"search cloud" (D3), and lets you turn any result into a script hook via
Gemini. Payments run through **Flutterwave**.

## Structure

```
askloom/
  backend/     Express + TypeScript API
  frontend/    React + Vite + D3
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env    # fill in your real keys
npm run dev              # http://localhost:4000
```

### Flutterwave setup (the payment part)

1. Create a Flutterwave account → Dashboard → **Settings > API Keys**. Copy
   your **Public Key** and **Secret Key** into `.env` as `FLW_PUBLIC_KEY` /
   `FLW_SECRET_KEY`. Use the `TEST` keys first.
2. Dashboard → **Settings > Webhooks**: set the URL to
   `https://your-backend-domain.com/api/payment/webhook`, and set a **Secret
   Hash** (any string you choose) — put that same string in `.env` as
   `FLW_SECRET_HASH`. Flutterwave sends this back in the `verif-hash` header
   on every webhook call, and `payment.ts` rejects anything that doesn't
   match it.
3. `FLW_REDIRECT_URL` is where Flutterwave sends the user back after paying
   (e.g. `https://yourapp.com/payment/callback`). Build a small page there
   that reads the `transaction_id` query param Flutterwave appends and calls
   `GET /api/payment/verify/:transactionId`.
4. Flow:
   - Frontend calls `POST /api/payment/initialize` with `{ plan, email }`
   - Backend calls Flutterwave's `/v3/payments` endpoint, gets back a hosted
     checkout `link`
   - Frontend redirects the browser to that link
   - User pays on Flutterwave's page → gets redirected to `FLW_REDIRECT_URL`
   - **Two confirmations happen, on purpose:**
     - The redirect-triggered `verify` call is instant UX feedback
     - The `webhook` call is the actual source of truth (a user could close
       the tab before the redirect fires, but the webhook always arrives)
   - Both currently have a `// TODO: mark pending.userId as isPaid = true`
     comment — wire that to your real user database when you add one.
5. Switch `FLW_PUBLIC_KEY`/`FLW_SECRET_KEY` to your live keys when ready to
   accept real payments, and re-point the webhook URL to production.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev    # http://localhost:5173
```

## What's stubbed vs. production-ready

- **Autocomplete scraping, clustering, radial visualization, script-hook
  generation, Flutterwave checkout/verify/webhook**: functional as written.
- **User accounts / database**: `dailyUsage` and `pendingTransactions` are
  in-memory Maps for this scaffold — swap for Postgres/Mongo + a real users
  table (matches the pattern you're already using in AgentForge/Atlas)
  before going live, otherwise usage limits and paid status reset on every
  server restart.
- **Auth**: `authMiddleware.ts` expects a JWT; wire up your actual
  signup/login flow to issue one.
