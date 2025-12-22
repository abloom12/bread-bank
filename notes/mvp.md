# MVP Plan (Solo-first → Production-ready)

This plan is designed for where you are _right now_: a personal budgeting app that you can build quickly for yourself and your portfolio **without spending days on SaaS research**, while still setting things up so that later production auth/hosting/billing is a contained upgrade—not a rewrite.

The core principle: **build the domain correctly from day 1 (tenant keys, data boundaries), but defer “SaaS plumbing” (OAuth, billing, seat management) until you have real product value.**

---

## Goals & Non-goals

### Goals

- Ship a working budgeting app for _you_ first.
- Keep the path to production **cheap**: adding auth + multi-user + billing later should feel like “install plumbing,” not “rebuild the house.”
- Maintain strong security fundamentals even in dev mode (don’t bake in unsafe patterns).

### Non-goals (for now)

- Bank syncing (Plaid, etc.).
- Complex accounting systems.
- Multi-household membership.
- Perfect infrastructure or enterprise-grade ops on day 1.

---

## Big Decisions (Lock these now)

These are the decisions that are painful to change later.

### 1) Tenant boundary: **Household = tenant** (you already chose this)

- A user belongs to exactly one household.
- Every finance record is scoped to `household_id`.

Why this matters: most real SaaS data-leak incidents come from _missing tenant scoping_. You want a structure where it’s hard to accidentally query the wrong tenant.

### 2) Future multi-budget support (YNAB-like) without multi-household

You can support multiple budgets later by adding a `budgets` table **under** household:

- `households` (tenant)
  - `budgets` (many)
    - `categories` / `transactions` / `allocations`

This keeps “single household per user” intact while still allowing multiple budget plans.

### 3) “Solo-first” identity strategy

Even without real auth now, your app should behave like it has a user/household.

**Plan:** keep server + DB in place locally, but add a dev-only identity middleware that sets:

- `req.userId`
- `req.householdId`
- `req.role = 'owner'`

Then later you swap the dev identity out for real OAuth/session auth.

---

## Architecture (Solo-first)

### Recommended solo-first stack (minimizes rework)

- **Client:** Vite + React (already)
- **API:** Express (already)
- **DB:** Postgres (already, migrations exist)

This is not “overkill”—it’s how you avoid a later rewrite.

Alternative (not recommended if you want easy production pivot): building directly on localStorage/SQLite without a consistent API boundary can lead to a big refactor later.

---

## Phase 0 — Setup & Guardrails (1–2 hours)

### ✅ Must do now

#### A) Add “dev identity” to the server

Create a middleware that injects a fixed identity _only in dev_.

Example (shape only; adjust to your code style):

```ts
// server/src/middleware/dev-auth.ts
import { Request, Response, NextFunction } from 'express';

export type AuthContext = {
  userId: string;
  householdId: string;
  role: 'owner' | 'member';
};

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthContext;
  }
}

export function devAuth(req: Request, _res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'production') return next();

  // Use real UUIDs that exist in your DB seed/dev migration.
  req.auth = {
    userId: process.env.DEV_USER_ID!,
    householdId: process.env.DEV_HOUSEHOLD_ID!,
    role: 'owner',
  };

  next();
}
```

Mount it early in the server app:

```ts
app.use(devAuth);
```

**Why:** it forces you to write the API as if users exist, without building login UI yet.

#### B) Enforce tenant scoping in every query

Rule: every DB read/write must include `household_id`.

Good:

```sql
SELECT * FROM transactions WHERE household_id = $1 AND id = $2;
```

Bad:

```sql
SELECT * FROM transactions WHERE id = $1;
```

#### C) Pick stable IDs now

- Use UUIDs.
- Keep `household_id` on every table.

### ⏳ Can wait

- Real auth (OAuth)
- Roles beyond owner/member
- Billing
- Email delivery

---

## Phase 1 — Data Model for the Real App (Do this early)

Even if you only have one user, set up tables like you’ll have many.

### ✅ Must do now

#### A) Add minimal tables for a budgeting MVP

Minimum viable set:

- `budgets` (optional now, but recommended if you want YNAB-like later)
- `categories`
- `transactions`
- `category_budgets` (monthly allocations)

A pragmatic model (high level):

- `transactions`
  - `id`
  - `household_id`
  - `budget_id` (optional if you skip multi-budget for MVP; recommended to include)
  - `amount_cents` (integer)
  - `currency` (e.g. "USD")
  - `category_id` (nullable)
  - `memo` (text)
  - `posted_at` (date)
  - `created_at`

- `categories`
  - `id`
  - `household_id`
  - `budget_id`
  - `name`
  - `kind` (income/expense)
  - `archived_at`

- `category_budgets`
  - `id`
  - `household_id`
  - `budget_id`
  - `category_id`
  - `month` (e.g. 2025-12-01)
  - `assigned_cents`

**Tip:** store money as integer cents; don’t use floats.

#### B) Seed dev data

Create a dev household + dev user + default budget so your dev middleware can reference real IDs.

You can seed either:

- via a migration
- via a small script

### ⏳ Can wait

- Multi-currency support (beyond a single currency column)
- Audit logs
- Advanced roles

---

## Phase 2 — Build the Core Product (Do this before auth/billing)

This is what makes the app worth deploying.

### ✅ Must do now (core features)

#### A) MVP screens

- Dashboard: month summary (total income, total spend, remaining)
- Categories: list + set assigned amount for current month
- Transactions: add/edit/delete, filter by month
- Basic settings: budget name (and maybe household name)

#### B) MVP API endpoints

Keep API endpoints small and boring:

- `GET /budgets/current`
- `GET /categories?month=YYYY-MM`
- `POST /categories`
- `POST /category-budgets` (assign $ for month)
- `GET /transactions?month=YYYY-MM`
- `POST /transactions`

**Tip:** keep a thin controller and do validation with Zod at the edge.

Example validation pattern:

```ts
import { z } from 'zod';

const CreateTransaction = z.object({
  postedAt: z.string(),
  amountCents: z.number().int(),
  categoryId: z.string().uuid().nullable(),
  memo: z.string().max(500).optional(),
});

type CreateTransaction = z.infer<typeof CreateTransaction>;
```

#### C) Core correctness rules (implement early)

These are business rules that define trust:

- Transaction amounts are cents (int)
- Month boundaries are consistent (timezone choice matters)
- Every query is scoped by `household_id`

### ⏳ Can wait

- CSV import/export
- Recurring transactions
- “Rules” automation

---

## Phase 3 — Production Pivot: Auth (when you’re ready)

You only do this once the core budgeting loop is solid.

### ✅ Must do before production

#### Option A (recommended for your current repo): Keep Express and add OAuth + sessions

Pros: most portable, teaches you full-stack, works great for a finance app long-term.

Core requirements:

- Google OAuth login
- Server session store in production (not in-memory)
- `/me` endpoint that returns current user + household
- Role: owner/member

Session store options:

- Managed Redis (Upstash, etc.)
- Postgres session table

Security notes:

- Prefer **same-origin** hosting (client and API same domain) to simplify cookies.
- If cross-origin: you must get CORS + SameSite + Secure cookies exactly right.

#### Option B: Supabase Auth + RLS (drop most Express)

Pros: fastest path to secure auth for a small team.
Cons: moderate lock-in (policies + auth model + client API shape).

If you choose Supabase later, your solo-first work still helps because:

- your tables already have `household_id`
- your business logic and UI are already designed around tenant scoping

### ⏳ Can wait

- Multiple auth providers
- Passkeys
- Enterprise/SSO

---

## Phase 4 — Production Pivot: Hosting

### ✅ Must do for production

Pick one of these stable “boring” combos:

#### Simple & common

- Frontend: Vercel
- API: Render or Fly.io (Express)
- DB: Neon or Supabase Postgres

What you’ll need to add:

- environment variables on hosts
- database migrations run in CI or as a release step
- HTTPS everywhere

### ⏳ Can wait

- Kubernetes
- Multi-region
- fancy CI/CD

---

## Phase 5 — Billing (only after real users or a clear plan)

Billing is not hard because of Stripe APIs; it’s hard because of product rules.

### ✅ Must decide before implementing billing

- Billing unit: **household**
- Billing admin: **household owner**
- Seat model: owner pays, invited members are seats

Pragmatic MVP billing:

- 1 plan
- includes N seats
- block invites if over limit

### ✅ Must do when you implement billing

- Stripe Checkout for subscription
- Stripe webhook handler (this is where truth lives)
- Store subscription state in DB (don’t trust client)

### ⏳ Can wait

- proration edge cases
- coupons
- invoices/tax/VAT automation

---

## Security Checklist (do early, not late)

Even for a small personal finance app, these are the basics that prevent common disasters.

### ✅ Do now

- Tenant scoping everywhere (`household_id`)
- Input validation (Zod) on every write endpoint
- Rate limiting on auth/invite endpoints once you add them
- Don’t log sensitive payloads (tokens, session IDs)

### ✅ Do before production

- Real session store
- CSRF strategy if using cookies cross-site (or avoid cross-site)
- HTTPS only + secure cookies
- Centralized error monitoring (Sentry is common)

---

## Practical “Don’t Get Stuck Researching” Rules

- If it doesn’t affect **data model** or **tenant isolation**, it can probably wait.
- You do _not_ need Stripe/Auth0/Supabase decisions to build transactions + categories + monthly rollups.
- The best way to avoid SaaS rabbit holes is: build the core loop, then add plumbing.

---

## Suggested Order of Work (copy/paste checklist)

### Week 1: Build value

- [ ] Add dev identity middleware + env vars
- [ ] Add core tables + migrations (household_id everywhere)
- [ ] Implement transactions CRUD
- [ ] Implement categories + monthly assigned amounts
- [ ] Implement month dashboard summary

### Week 2: Product polish

- [ ] Better UX (forms, validation errors)
- [ ] CSV export (optional)
- [ ] Basic settings page

### Week 3+: Production pivot

- [ ] Add Google OAuth + sessions
- [ ] Deploy API + DB + frontend
- [ ] Invite flow

### After traction: billing

- [ ] Stripe checkout + webhook + entitlements

---

## Notes tailored to your repo (quick callouts)

- You already have a good foundation: shared Zod schemas, Postgres migrations, and Express middleware scaffolding.
- Your current server session middleware exists but isn’t mounted yet; for solo-first you can ignore real sessions and just use the dev identity.
- You already chose the correct tenant boundary (household). Keep leaning into that.
