# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack monorepo using npm workspaces: React 19 frontend (Vite), Express 5 backend, PostgreSQL database. Project name: "Bread Bank".

## Commands

```bash
# Development
npm run dev:client          # Vite dev server (port 5173, proxies /api to :3000)
npm run dev:server          # Express with tsx watch (port 3000)

# Build & Typecheck
npm run build               # Build all packages (shared → client → server)
npm run typecheck           # TypeScript check all packages

# Testing
npm -w client run test      # Run Vitest tests

# Linting
npm -w client run lint      # ESLint check

# Database
npm -w server run migrate:up       # Run pending migrations
npm -w server run migrate:down     # Rollback last migration
npm -w server run migrate:create   # Create new migration

# Auth
npm run auth:generate       # Generate better-auth types
```

## Architecture

```
/
├── client/              # React 19 + Vite + TanStack (Router, Query, Form)
├── server/              # Express 5 + TypeScript + better-auth
└── packages/shared/     # Shared types (@app/shared)
```

### Client (`client/`)

- **Routing**: TanStack Router with file-based routes in `src/routes/`
  - Route groups: `(app)/` for protected routes, `(guest)/` for public routes
  - `routeTree.gen.ts` is auto-generated
- **State**: TanStack Query for server state, TanStack Form for forms
- **Styling**: TailwindCSS 4 + CVA for component variants
- **API Client**: `src/lib/api.ts` - typed HTTP client with auto-redirect on 401
- **Auth Client**: `src/lib/auth-client.ts` - better-auth client
- **Path alias**: `@/*` → `src/*`

#### TanStack Router Rules (Claude, read this before touching routes)

Follow these patterns when creating or modifying routes:

- Use **file-based routing** via `createFileRoute` and route files in `src/routes/`.
- Prefer **loaders/beforeLoad** over React `useEffect` for data fetching or redirects.
- Treat **search params** and **path params** as **fully typed first-class data**.
- Always use TanStack navigation APIs (`<Link />`, `router.navigate`) instead of React Router patterns or history hacks.
- Never write manual route trees; rely on the generated `routeTree.gen.ts`.
- When adding or changing protected routes, maintain `(app)/` and `(guest)/` folder semantics.

For examples, edge cases, advanced routing patterns, and the full official rule set:
**see `docs/rules/tanstack-router.md`.**
This file contains the full official rule set from @tanstack/react-router. Use it as reference when implementing or refactoring routing logic.

### Server (`server/`)

- **Entry**: `server.ts` (HTTP setup), `app.ts` (Express middleware)
- **Auth**: better-auth at `/api/auth/*` with admin and organization plugins
- **Features**: Feature-based organization in `src/features/`
- **Database**: `src/db/db.ts` (pg Pool), migrations in `src/db/migrations/`
- **Config**: Environment validation with Zod in `src/config/env.ts`

### Shared (`packages/shared/`)

- Shared types exported as `@app/shared`
- API response types, auth configuration
