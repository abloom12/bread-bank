# Server

Express 5 API server with TypeScript, PostgreSQL, and Google OAuth.

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| Database | PostgreSQL |
| Migrations | node-pg-migrate |
| Validation | Zod |
| Auth | Google OAuth 2.0, express-session |
| Security | Helmet, CORS, rate-limit |

## Folder Structure

```
server/src/
├── features/                    # Vertical feature slices
│   ├── identity/                # DEPENDENCY LAYER - user/household/invite primitives
│   │   ├── repositories/        # Internal: DB queries + row mapping
│   │   │   ├── user.repository.ts
│   │   │   ├── household.repository.ts
│   │   │   └── invite.repository.ts
│   │   ├── identity.service.ts  # Public API for identity operations
│   │   └── index.ts             # Re-exports public API
│   │
│   ├── auth/                    # OAuth flows + /api/auth/* routes
│   │   ├── auth.routes.ts
│   │   └── google-oauth.ts
│   │
│   ├── invite/                  # /api/invites/* routes
│   │   └── invite.routes.ts
│   │
│   └── health/                  # /api/health route
│       └── health.routes.ts
│
├── db/                          # Database infrastructure
│   ├── db.ts                    # PostgreSQL connection pool
│   ├── migrations/              # node-pg-migrate files
│   └── procedures/              # Stored procedures (if needed)
│
├── routes/
│   └── index.ts                 # Aggregates all feature routes
│
├── middleware/                  # Cross-cutting concerns
│   ├── async-handler.ts         # Async error wrapper
│   ├── require-auth.ts          # Authentication guard
│   ├── session.ts               # express-session config
│   └── validate.ts              # Zod request validation
│
├── lib/                         # Shared utilities
│   ├── AppError.ts              # Custom error class
│   └── api-response.ts          # sendSuccess/sendError helpers
│
├── config/
│   ├── env.ts                   # Zod-validated environment
│   └── index.ts                 # Typed config export
│
├── app.ts                       # Express app factory
└── server.ts                    # Entry point
```

## Architecture

### Dependency Flow

```
┌─────────┐     ┌──────────┐     ┌─────────┐
│  auth   │────▶│ identity │◀────│ invite  │
└─────────┘     └──────────┘     └─────────┘
                     │
                     ▼
                 ┌──────┐
                 │  db  │
                 └──────┘
```

- **identity/** is a dependency layer, not a feature with routes
- **auth/** and **invite/** depend on identity for user/household operations
- Future features (donations, pantry) will also depend on identity
- **db/** is pure infrastructure (connection pool only)

### Key Patterns

**1. Vertical Slices**
Each feature owns its routes and feature-specific logic. Shared data access goes through the identity module.

**2. Identity as Dependency Layer**
- Small public API via `identity.service.ts`
- Repositories are internal implementation details
- Prevents "auth owns households" smell
- Explicit dependency direction

**3. Cross-Cutting Middleware**
`requireAuth` lives in `middleware/` because it protects multiple features (`/invites`, future `/donations`, etc.)

**4. Standardized API Responses**
```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { message: string } }
```

## Commands

```bash
# Development
npm run dev:server     # Start with tsx watch (port 3000)

# Build
npm run build:server   # Compile TypeScript

# Database
npm run db:migrate     # Run pending migrations
npm run db:migrate:down # Rollback last migration
```

## Environment Variables

See `.env.example` for required variables:

- `PORT` - Server port (default: 3000)
- `APP_ORIGIN` - Frontend URL for redirects
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)
- `SESSION_SECRET` - Session encryption key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URL` - OAuth callback URL
- `DB_*` - PostgreSQL connection details
