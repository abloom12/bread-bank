# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bread Bank is a full-stack monorepo banking/financial service application built with TypeScript. It uses yarn/npm workspaces with three packages: `client`, `server`, and `packages/shared`.

## Common Commands

```bash
# Development (run in separate terminals)
npm run dev:client     # Vite dev server on :5173
npm run dev:server     # Express server on :3000

# Build & Type Check
npm run build          # Build all packages (shared → client → server)
npm run typecheck      # Typecheck all packages

# Database migrations
npm -w server run migrate:up          # Apply migrations
npm -w server run migrate:down        # Rollback migration
npm -w server run migrate:create -- -n name  # Create new migration

# Testing
npm -w client run test     # Vitest for client

# Linting
npm -w client run lint     # ESLint check

# Auth type generation (run when adding better-auth plugins)
npm run auth:generate
```

## Architecture

### Client (`client/`)
- **React 19** with **Vite 7** and SWC
- **TanStack Router** - File-based routing in `src/routes/`
- **TanStack Query** - Server state management
- **TanStack Form** - Form state and validation
- **Tailwind CSS 4** with Vite plugin
- **better-auth** client for authentication
- Path alias: `@/*` maps to `src/*`
- API proxy: `/api` → `http://localhost:3000`

### Server (`server/`)
- **Express 5** with TypeScript
- **PostgreSQL** with pg client
- **better-auth** for authentication (with admin and organization plugins)
- **node-pg-migrate** for database migrations
- Environment validation via Zod in `src/config/env.ts`

### Shared (`packages/shared/`)
- Shared TypeScript types and Zod schemas
- Import as `@app/shared`

## Key Files

- `server/src/lib/auth.ts` - better-auth configuration
- `server/src/app.ts` - Express middleware stack
- `server/src/config/env.ts` - Required environment variables
- `client/src/lib/auth-client.ts` - better-auth React client
- `client/src/routes/__root.tsx` - Root layout with navigation

## Code Patterns

- **Feature-based organization**: `features/{feature}/` in both client and server
- **UI components**: `client/src/components/ui/` using class-variance-authority (CVA)
- **Middleware**: `server/src/middleware/` for Express middleware
- **Routes**: Express routes in `server/src/routes/`, React routes in `client/src/routes/`

## Environment Setup

Copy `server/.env.example` to `server/.env` and configure:
- `BETTER_AUTH_SECRET` (min 32 chars)
- `BETTER_AUTH_URL`
- `APP_ORIGIN`, `CORS_ORIGIN`
- PostgreSQL connection: `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`, `DB_PORT`

## Auth Endpoints (via better-auth)

- `POST /api/auth/sign-up/email` - Register
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Current session
