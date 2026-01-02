# Repository Guidelines

## Project Structure & Module Organization
- Monorepo with npm workspaces: `client/` (React app), `server/` (Express API), `packages/shared/` (shared TS types/schemas).
- Client source lives in `client/src/` with route files in `client/src/routes/` and UI components in `client/src/components/ui/`.
- Server source lives in `server/src/` with routes in `server/src/routes/`, middleware in `server/src/middleware/`, and migrations in `server/src/db/migrations/`.
- Shared types and Zod schemas live in `packages/shared/src/` and are imported as `@app/shared`.

## Build, Test, and Development Commands
- `npm run dev:client` starts the Vite dev server on `:5173`.
- `npm run dev:server` starts the Express server on `:3000`.
- `npm run build` builds shared → client → server.
- `npm run typecheck` runs type checks across all packages.
- `npm -w client run lint` runs ESLint for the client.
- `npm -w client run test` runs Vitest for the client.
- `npm -w server run migrate:up|down|create -- -n name` manages database migrations.
- `npm run auth:generate` regenerates better-auth types when plugins change.

## Coding Style & Naming Conventions
- TypeScript everywhere; 2-space indentation, semicolons, single quotes (Prettier enforces this in `.prettierrc`).
- Tailwind classes follow a layout → sizing → typography → color → borders → states order.
- Client alias `@/*` maps to `client/src/*`.
- Prefer feature-based folders (`features/{feature}/`) when adding new modules.

## Testing Guidelines
- Client tests use Vitest and Testing Library; run with `npm -w client run test`.
- No server tests are present yet; add tests alongside code using `*.test.ts`/`*.test.tsx` naming when introduced.

## Commit & Pull Request Guidelines
- Commit messages are short, descriptive sentences (no conventional commit prefixes required).
- PRs should include a brief summary, testing notes (commands run), and UI screenshots for client changes.
- Link related issues when applicable.

## Security & Configuration Tips
- Copy `server/.env.example` to `server/.env` and set `BETTER_AUTH_SECRET`, `APP_ORIGIN`, `CORS_ORIGIN`, and PostgreSQL credentials.
- Keep secrets out of the repo; use environment variables for local dev.
