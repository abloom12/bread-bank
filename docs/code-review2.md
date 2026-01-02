# Code: Client Boilerplate Review (non-UI)

## Scope

- Reviewed `client/src` and `client` config for missing baseline plumbing (ignoring styling).

## Findings / gaps (ordered by impact)

1. Hard-coded auth base URL with no validated env config. This blocks easy deploy/preview setups and risks pointing to prod unintentionally. See `client/src/lib/auth-client.ts`.
2. Auth forms do not surface server errors or map errors to fields; both TODOs are left in place. This makes failures silent and hard to debug. See `client/src/features/auth/LoginForm.tsx` and `client/src/features/auth/SignupForm.tsx`.
3. `signup.schema.ts` and `login.schema.ts` are empty and unused. They look intended for shared validation but are currently dead files. See `client/src/features/auth/signup.schema.ts` and `client/src/features/auth/login.schema.ts`.
4. API access is ad-hoc and untyped. `HealthPage` uses raw `fetch` without a shared client, base URL, credentials, or response validation. See `client/src/features/health/health.tsx`.
5. React Query uses defaults without a shared config or error handling/logging strategy. This makes behavior inconsistent across future features. See `client/src/main.tsx`.
6. No test setup or helpers for client tests despite dependencies being installed. This slows down adding regression tests later. See `client/package.json`.

## Suggested boilerplate additions

- Env config module: `client/src/env.ts` that validates `VITE_API_URL`, `VITE_AUTH_URL`, etc. with Zod, plus typed exports. Wire `client/src/lib/auth-client.ts` to it.
- API client wrapper: `client/src/lib/api.ts` with `fetchJson` (base URL, credentials, typed errors). Optionally parse responses via shared Zod schemas from `@app/shared`.
- Query client config: `client/src/lib/query-client.ts` that sets sensible defaults (retry, staleTime, refetchOnWindowFocus) and a centralized error handler. Use it in `client/src/main.tsx`.
- Auth/session boilerplate: `client/src/features/auth/useSession.ts`, `AuthProvider`, and a `requireAuth` route guard using TanStack Router `beforeLoad`. This enables protected routes and redirect-to-login flow.
- Form error handling pattern: a small helper that maps `better-auth` errors to form/field errors and a shared error summary component for auth flows.
- Testing scaffolding: `vitest.config.ts`, `client/src/test/setup.ts` (jest-dom), and `client/src/test/utils.tsx` for a render helper that wraps Router + QueryClient. Add starter tests for `LoginForm` and `SignupForm`.
- Optional: MSW for API mocking in tests and local dev.

## Proposed plan

1. Add env validation and update `auth-client` and API base URL wiring.
2. Introduce API client + query client config; refactor `HealthPage` to use it.
3. Add auth session utilities + route guard helpers.
4. Add form error handling helpers for auth flows.
5. Add test setup and first auth form tests; wire MSW if desired.
