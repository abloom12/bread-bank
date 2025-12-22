# Better-Auth Implementation Plan

## Summary
Implement better-auth for email/password authentication with future support for Google OAuth and magic links. The packages are already installed (v1.4.7), so this focuses on configuration and integration.

## Environment Setup (server/.env is correct location)

You're correct - add better-auth config to `/Users/ash/dev/bread-bank/server/.env`, not root.

### Files to modify:

**1. `/Users/ash/dev/bread-bank/server/.env`** (add these variables)
```bash
BETTER_AUTH_SECRET=<generate-via-openssl-rand-base64-32>
BETTER_AUTH_URL=http://localhost:3000
```

**2. `/Users/ash/dev/bread-bank/server/.env.example`** (add same variables as placeholders)

**3. `/Users/ash/dev/bread-bank/server/src/config/env.ts`** (extend Zod schema)
```typescript
const EnvSchema = z.object({
  // ... existing fields ...

  // Better Auth (add these)
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),

  // OAuth (optional, for future Google OAuth)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});
```

**4. `/Users/ash/dev/bread-bank/server/src/config/index.ts`** (export auth config)
```typescript
export const config = {
  // ... existing config ...
  auth: {
    secret: env.BETTER_AUTH_SECRET,
    baseUrl: env.BETTER_AUTH_URL,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
  },
};
```

## Database Migration

Better-auth needs: `session`, `account`, and `verification` tables. Your existing `users` table will be extended with `password_hash`.

**Create: `/Users/ash/dev/bread-bank/server/src/db/migrations/004_add-auth-tables.ts`**

Key tables:
- Add `password_hash` column to existing `users` table (nullable for OAuth users)
- Create `session` table (id, user_id, expires_at, token, ip_address, user_agent)
- Create `account` table (for OAuth providers - id, user_id, provider_id, account_id, tokens)
- Create `verification` table (for email verification/password reset)

Run: `npm -w server run migrate:up`

## Server Implementation

**1. Create: `/Users/ash/dev/bread-bank/server/src/lib/auth.ts`**

Initialize better-auth with:
- PostgreSQL database connection (use same pool config as db.ts)
- Email/password authentication enabled (minPasswordLength: 8, autoSignIn: true)
- Google OAuth conditionally enabled if env vars present
- Session config (7 day expiry)

**2. Modify: `/Users/ash/dev/bread-bank/server/src/app.ts`**

**CRITICAL MIDDLEWARE ORDER:**
```typescript
// 1. Morgan (logging) ✓ (already first)
// 2. Better-auth handler - ADD THIS BEFORE express.json()
app.all('/api/auth/*splat', toNodeHandler(auth));
// 3. express.json() - MOVE TO AFTER better-auth
app.use(express.json({ limit: '1mb' }));
// 4. Helmet, rate-limit, CORS ✓ (keep as-is)
// 5. Routes ✓ (keep as-is)
```

Import: `toNodeHandler` from 'better-auth/node' and `auth` from './lib/auth'

**3. Create: `/Users/ash/dev/bread-bank/server/src/middleware/auth.ts`**

Two middleware functions:
- `requireAuth` - Throws 401 if not authenticated, attaches `req.auth` with user/session
- `optionalAuth` - Attaches `req.auth` if authenticated, silent fail otherwise

Also add TypeScript declaration to augment Express Request type.

**4. Create: `/Users/ash/dev/bread-bank/server/src/routes/auth.routes.ts`**

Add custom endpoint: `GET /api/auth/me` that uses `requireAuth` middleware and returns user/session data using the existing `ApiResponse<T>` pattern.

**5. Modify: `/Users/ash/dev/bread-bank/server/src/routes/index.ts`**

Mount auth router: `apiRouter.use('/auth', authRouter);`

Note: Better-auth handles `/api/auth/*` routes (signup, signin, signout, etc.). The custom auth.routes.ts is for app-specific endpoints like `/me`.

## Client Implementation

**1. Create: `/Users/ash/dev/bread-bank/client/src/lib/auth-client.ts`**

Initialize better-auth React client:
```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: undefined, // Vite proxy handles /api in dev
});

export const { useSession } = authClient;
```

**2. Create: `/Users/ash/dev/bread-bank/client/src/providers/AuthProvider.tsx`**

React Context provider that:
- Calls `useSession()` hook from auth-client
- Provides `{ session, isLoading, isAuthenticated }` to children
- Export `useAuth()` hook for consuming components

**3. Modify: `/Users/ash/dev/bread-bank/client/src/main.tsx`**

Wrap app with AuthProvider (inside QueryClientProvider, outside RouterProvider):
```tsx
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
</QueryClientProvider>
```

**4. Create: `/Users/ash/dev/bread-bank/client/src/routes/login.tsx`**

Login page with:
- Email/password form
- `authClient.signIn.email({ email, password })` on submit
- Navigate to `/` on success
- Redirect to `/` if already authenticated

**5. Create: `/Users/ash/dev/bread-bank/client/src/routes/signup.tsx`**

Signup page with:
- Name/email/password form
- `authClient.signUp.email({ name, email, password })` on submit
- Navigate to `/` on success (autoSignIn enabled)

**6. Create: `/Users/ash/dev/bread-bank/client/src/components/ProtectedRoute.tsx`**

Wrapper component that:
- Shows loading state while `isLoading`
- Navigates to `/login` if not authenticated
- Renders children if authenticated

**7. Modify: `/Users/ash/dev/bread-bank/client/src/routes/__root.tsx`**

Add navigation:
- Show Login/Signup links when not authenticated
- Show user name and Sign Out button when authenticated
- Use `authClient.signOut()` for sign out

**8. Create: `/Users/ash/dev/bread-bank/client/src/routes/dashboard.tsx`** (example protected route)

Wrap content in `<ProtectedRoute>` component to demonstrate pattern.

## Shared Types

**1. Modify: `/Users/ash/dev/bread-bank/packages/shared/src/schemas/user.ts`**

Add `passwordHash: z.string().nullable()` to UserSchema (keep it out of PublicUserSchema for security).

**2. Create: `/Users/ash/dev/bread-bank/packages/shared/src/schemas/session.ts`**

Define SessionSchema with id, userId, expiresAt, token fields.

**3. Create: `/Users/ash/dev/bread-bank/packages/shared/src/schemas/auth.ts`**

Define request/response schemas:
- SignUpRequestSchema (name, email, password)
- SignInRequestSchema (email, password)
- AuthMeResponseSchema (user, session)

**4. Modify: `/Users/ash/dev/bread-bank/packages/shared/src/main.ts`**

Export the new auth and session schemas.

## Implementation Order

1. **Environment & Config** (5 min) - Add env vars, update Zod validation
2. **Shared Types** (5 min) - Add schemas first so server can use them
3. **Database Migration** (10 min) - Create and run migration
4. **Server Auth Core** (15 min) - Create auth.ts, update app.ts middleware order
5. **Server Auth Middleware & Routes** (10 min) - Create middleware and custom endpoints
6. **Client Auth Setup** (10 min) - Create auth-client, AuthProvider, update main.tsx
7. **Client Auth UI** (15 min) - Create login/signup/dashboard routes, ProtectedRoute component
8. **Testing** (15 min) - Test signup, login, protected routes, logout

Total: ~90 minutes

## Testing Checklist

- [ ] `openssl rand -base64 32` to generate BETTER_AUTH_SECRET
- [ ] Environment validation passes on server startup
- [ ] Migration creates 3 new tables + password_hash column
- [ ] Better-auth health check: `GET http://localhost:3000/api/auth/ok` returns success
- [ ] Can signup with email/password
- [ ] Can login with email/password
- [ ] Session persists across page reloads
- [ ] Protected routes redirect to /login when not authenticated
- [ ] Protected routes accessible when authenticated
- [ ] Can sign out successfully
- [ ] Session cleared after sign out

## Future Enhancements (after initial setup)

1. **Google OAuth** - Enable social provider in server auth config (env vars already supported)
2. **Magic Link** - Add better-auth magic link plugin
3. **Email Verification** - Add verification flow
4. **Password Reset** - Add reset password functionality
5. **Session Management UI** - View and revoke active sessions

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

## Key Technical Notes

1. **Why server/.env?** - dotenv/config in server.ts loads from server/.env, not root
2. **Middleware order matters** - Better-auth MUST come before express.json() or it won't work
3. **Express 5 syntax** - Use `/api/auth/*splat` (not `/*` from Express 4)
4. **No package installation needed** - better-auth@1.4.7 already installed on both client/server
5. **Database approach** - Extend existing users table + add better-auth tables (hybrid approach)
6. **Type safety** - Shared package provides type safety across client/server boundary
