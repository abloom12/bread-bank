Plan: Enhance React Client Starter Kit
Focus on maturing the client into a batteries-included, opinionated starter: solid testing + lint/format workflow, clear architecture around routing/data fetching/state, reusable UI primitives, and good docs/env/CI scaffolding. The idea is to lean into what you already chose (Vite, TanStack Router/Query, Tailwind, feature folders) and add just enough structure and examples that a new project (or teammate) can follow the patterns without guessing.

Steps
Solidify testing by adding vitest.config.ts, a setupTests.ts, and 2–3 example tests under src (e.g., for lib/search-params.ts and a simple route component).
Tighten DX with scripts and hooks in package.json and root package.json (lint/format commands, optional Husky + lint-staged) so formatting and linting run automatically.
Establish a minimal design system by adding basic UI components under components (Button, Input, Card, Alert) using Tailwind + cn + class-variance-authority, and update \_\_root.tsx and feature pages to use them.
Extract and formalize data-fetching patterns into client/src/features/users/users-queries.ts and/or client/src/lib/query.ts, adding at least one React Query mutation example and standardizing query keys.
Add env/config helpers in client/src/lib/env.ts to read/validate import.meta.env, update api.ts and vite.config.ts usage, and document this in README.md.
Introduce simple auth and protected-route scaffolding with a small auth store/context under client/src/features/auth and a guarded layout or route in routes demonstrating TanStack Router’s beforeLoad/redirect pattern.
Improve UX for loading and errors via shared components in components (e.g., Spinner, ErrorMessage/Alert) and apply them across health.tsx, client/src/features/users/\*, and search.tsx.
Add a light client-state pattern (e.g., a Zustand or context-based store in client/src/lib/state for theme/toasts) and wire a simple example into the root layout.
Provide at least one “real” form example using either React Hook Form + Zod under users (e.g., create/update user) or a dedicated client/src/features/settings module.
Add DX/docs polish: VS Code settings and recommendations under .vscode/, expand README.md with architecture and examples, and (optionally) add .github/workflows/client-ci.yml to run lint, test, and build for the client.
Further Considerations
Depth vs. minimalism: Do you prefer a lean starter (only tests + lint + basic UI) or a “batteries included” kit (auth, forms, playground like Storybook/Ladle)?
State library choice: Are you open to adding a small client-state lib (e.g., Zustand), or would you rather stick to React context to keep dependencies minimal?
Component playground: Would you like a component playground (Storybook/Ladle) baked in now, or should that be an optional add-on recipe in the docs?
