# Better-Auth Plan

## Critical Files Summary

### Server (8 files)

- `server/.env` - Add BETTER_AUTH_SECRET, BETTER_AUTH_URL
- `server/.env.example` - Document new env vars
- `server/src/config/env.ts` - Extend Zod schema
- `server/src/config/index.ts` - Export auth config
- `server/src/lib/auth.ts` - **NEW** - Better-auth instance
- `server/src/app.ts` - Mount better-auth handler (BEFORE express.json)
- `server/src/middleware/auth.ts` - **NEW** - requireAuth/optionalAuth
- `server/src/routes/auth.routes.ts` - **NEW** - Custom auth endpoints
- `server/src/routes/index.ts` - Mount auth router
- `server/src/db/migrations/004_add-auth-tables.ts` - **NEW** - Database schema

### Client (8 files)

- `client/src/lib/auth-client.ts` - **NEW** - Better-auth React client
- `client/src/providers/AuthProvider.tsx` - **NEW** - Auth context
- `client/src/main.tsx` - Wrap with AuthProvider
- `client/src/routes/__root.tsx` - Add auth navigation
- `client/src/routes/login.tsx` - **NEW** - Login page
- `client/src/routes/signup.tsx` - **NEW** - Signup page
- `client/src/routes/dashboard.tsx` - **NEW** - Example protected route
- `client/src/components/ProtectedRoute.tsx` - **NEW** - Route guard

### Shared (4 files)

- `packages/shared/src/schemas/user.ts` - Add passwordHash field
- `packages/shared/src/schemas/session.ts` - **NEW**
- `packages/shared/src/schemas/auth.ts` - **NEW**
- `packages/shared/src/main.ts` - Export new schemas

## Server Implementation

### 1. `server/src/features/auth/auth.middleware.ts`

Middleware for protecting routes:

```typescript
import type { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth';
import { AppError } from '../../lib/AppError';

/**
 * Require authentication - throws 401 if no valid session
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    (req as any).auth = session;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth - attaches session if present but doesn't require it
 */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session) {
      (req as any).auth = session;
    }
    next();
  } catch {
    next();
  }
};
```

### 2. `server/src/features/auth/auth.types.ts`

Type definitions:

```typescript
import type { auth } from './auth';

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
export type User = NonNullable<Session>['user'];

declare global {
  namespace Express {
    interface Request {
      auth?: Session;
    }
  }
}
```

### 3. `server/src/features/auth/index.ts`

Module exports:

```typescript
export { auth } from './auth';
export { requireAuth, optionalAuth } from './auth.middleware';
export type { Session, User } from './auth.types';
```

## Auth Endpoints (provided by better-auth)

| Method | Endpoint                            | Description                  |
| ------ | ----------------------------------- | ---------------------------- |
| POST   | `/api/auth/sign-up/email`           | Register with email/password |
| POST   | `/api/auth/sign-in/email`           | Login                        |
| POST   | `/api/auth/sign-out`                | Logout                       |
| GET    | `/api/auth/session`                 | Get current session          |
| POST   | `/api/auth/send-verification-email` | Resend verification email    |
| GET    | `/api/auth/verify-email`            | Verify email (callback URL)  |
| POST   | `/api/auth/forget-password`         | Request password reset       |
| POST   | `/api/auth/reset-password`          | Reset password               |
| GET    | `/api/auth/ok`                      | Health check                 |

---
