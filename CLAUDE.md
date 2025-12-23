# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies (from root)
npm install

# Development
npm run dev:client    # Start Vite dev server (port 5173, proxies /api to localhost:3000)
npm run dev:server    # Start Express server with tsx watch (port 3000)

# Building
npm run build         # Build shared, client, and server
npm run build:shared  # Build shared package (run first if types changed)

# Type checking
npm run typecheck     # Check all packages

# Client-specific
npm -w client run lint    # ESLint
npm -w client run test    # Vitest
```

## Architecture

This is a TypeScript monorepo with npm workspaces:

- **client/** - React SPA using Vite, TanStack Router/Query/Form, Zod, Tailwind CSS
- **server/** - Express 5 API with Zod validation, Postresql databsae using pg to connect
- **packages/shared/** - Shared types and schemas (published as `@app/shared`)

### Client Structure

Routes are file-based using TanStack Router. Route files in `client/src/routes/` auto-generate `routeTree.gen.ts`.

- `src/routes/` - Route components (file-based routing)
- `src/components/` - Reusable UI components
  - `src/components/ui/` - Base UI components (Button, etc.) using CVA + Tailwind
- `src/features/` - Feature modules (e.g., `features/health/`)
- `src/lib/` - Utilities (`api.ts` for fetch wrapper, `cn.ts` for classnames, `search-params.ts` for type-safe URL params)

### Server Structure

- `src/app.ts` - Express app factory with middleware (helmet, cors, rate-limit, morgan)
- `src/server.ts` - Entry point, loads env via dotenv
- `src/config/` - Zod-validated environment config
- `src/routes/` - API route handlers (mounted at `/api`)
- `src/db/` - PostgreSQL connection pool and migrations
- `src/features/` - Feature modules (auth, households, etc.)
- `src/lib/` - Utilities (AppError, api-response helpers)
- `src/middleware/` - Validation, session, async error handling

### Shared Package

Contains Zod schemas and TypeScript types shared between client and server. Uses `ApiResponse<T>` type for consistent API response format:

```typescript
type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string } };
```
