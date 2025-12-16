# Auth Flow Implementation Plan

## Overview

Implement Google OAuth authentication with cookie-based sessions. Each user gets an auto-created household. Users can invite others to join their household.

**Key decisions:**

- Cookie-based sessions (not JWT) - simpler, more secure for web apps, easy to revoke
- Single auth provider per user - user picks Google, Apple, or email (not multiple)
- Auto-household creation - every user gets a household on signup (hidden from solo users in UI)
- Invite system - users can invite others to join their household via email

---

## Database Schema

### Entity Relationship

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  households  │       │    users     │       │   invites    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──┐   │ id (PK)      │◄──┐   │ id (PK)      │
│ name         │   │   │ household_id │───┘   │ household_id │───┐
│ created_at   │   │   │ email        │       │ email        │   │
│ updated_at   │   │   │ name         │   ┌───│ invited_by   │   │
└──────────────┘   │   │ avatar_url   │   │   │ token        │   │
                   │   │ auth_provider│   │   │ expires_at   │   │
                   │   │ provider_id  │   │   │ used_at      │   │
                   │   │ created_at   │   │   │ created_at   │   │
                   │   │ updated_at   │   │   └──────────────┘   │
                   │   └──────────────┘   │                      │
                   │          │           │                      │
                   └──────────┼───────────┴──────────────────────┘
                              │
                     users.household_id → households.id
                     invites.household_id → households.id
                     invites.invited_by → users.id
```

---

## Phase 1: Database Migrations

### 1.1 households table

**File:** `server/src/db/migrations/{timestamp}_create-households-table.ts`

```
┌──────────────┬──────────────┬─────────────────────────────────────────┐
│ Column       │ Type         │ Constraints                             │
├──────────────┼──────────────┼─────────────────────────────────────────┤
│ id           │ UUID         │ PK, DEFAULT gen_random_uuid()           │
│ name         │ VARCHAR(255) │ NOT NULL                                │
│ created_at   │ TIMESTAMPTZ  │ NOT NULL, DEFAULT now()                 │
│ updated_at   │ TIMESTAMPTZ  │ NOT NULL, DEFAULT now()                 │
└──────────────┴──────────────┴─────────────────────────────────────────┘
```

**Notes:**

- `gen_random_uuid()` is native to PostgreSQL 13+ (no extension needed)
- `name` is NOT unique (multiple households can be named "My House")
- `TIMESTAMPTZ` stores timezone-aware timestamps (recommended for PostgreSQL)

---

### 1.2 users table

**File:** `server/src/db/migrations/{timestamp}_create-users-table.ts`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            users                                        │
├───────────────┬──────────────┬──────────────────────────────────────────┤
│ Column        │ Type         │ Constraints                              │
├───────────────┼──────────────┼──────────────────────────────────────────┤
│ id            │ UUID         │ PRIMARY KEY, DEFAULT gen_random_uuid()   │
│ household_id  │ UUID         │ NOT NULL, FK → households(id)            │
│               │              │ ON DELETE CASCADE                        │
│ email         │ VARCHAR(255) │ NOT NULL, UNIQUE                         │
│ name          │ VARCHAR(255) │ NOT NULL                                 │
│ avatar_url    │ VARCHAR(500) │ NULL (optional)                          │
│ auth_provider │ VARCHAR(50)  │ NOT NULL ('google','apple','email')      │
│ provider_id   │ VARCHAR(255) │ NOT NULL                                 │
│ created_at    │ TIMESTAMPTZ  │ NOT NULL, DEFAULT now()                  │
│ updated_at    │ TIMESTAMPTZ  │ NOT NULL, DEFAULT now()                  │
└───────────────┴──────────────┴──────────────────────────────────────────┘

Indexes:
  - idx_users_household_id ON users(household_id)
  - UNIQUE(auth_provider, provider_id) -- prevents duplicate OAuth accounts
```

**Column explanations:**

- `household_id` - Links user to their household. CASCADE means if household is deleted, user is too
- `email` - Unique across all users. Used to match invites to new signups
- `auth_provider` - Which OAuth provider ('google', 'apple') or 'email' for password auth
- `provider_id` - The unique ID from the OAuth provider (Google's `sub` claim). For email auth, could be the email itself or a separate ID

**Why UNIQUE(auth_provider, provider_id)?**

- Prevents the same Google account from creating multiple users
- Allows same provider_id across different providers (unlikely but possible)

---

### 1.3 invites table

**File:** `server/src/db/migrations/{timestamp}_create-invites-table.ts`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           invites                                       │
├──────────────┬──────────────┬───────────────────────────────────────────┤
│ Column       │ Type         │ Constraints                               │
├──────────────┼──────────────┼───────────────────────────────────────────┤
│ id           │ UUID         │ PRIMARY KEY, DEFAULT gen_random_uuid()    │
│ household_id │ UUID         │ NOT NULL, FK → households(id)             │
│              │              │ ON DELETE CASCADE                         │
│ email        │ VARCHAR(255) │ NOT NULL                                  │
│ token        │ VARCHAR(64)  │ NOT NULL, UNIQUE                          │
│ invited_by   │ UUID         │ NOT NULL, FK → users(id)                  │
│              │              │ ON DELETE CASCADE                         │
│ expires_at   │ TIMESTAMPTZ  │ NOT NULL                                  │
│ used_at      │ TIMESTAMPTZ  │ NULL (set when invite accepted)           │
│ created_at   │ TIMESTAMPTZ  │ NOT NULL, DEFAULT now()                   │
└──────────────┴──────────────┴───────────────────────────────────────────┘

Indexes:
  - idx_invites_household_id ON invites(household_id)
  - idx_invites_token ON invites(token)
  - idx_invites_email ON invites(email)
```

**Column explanations:**

- `token` - Random 64-character hex string for invite links (32 bytes = 64 hex chars)
- `invited_by` - Which user created this invite (for audit trail)
- `expires_at` - When the invite expires (typically 7 days from creation)
- `used_at` - NULL means pending, timestamp means accepted. We keep rows for audit trail

**Checking if invite is valid:**

```sql
WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()
```

---

## Phase 2: Shared Types (Zod Schemas)

### 2.1 User schema

**File:** `packages/shared/src/schemas/user.ts`

```typescript
// Full user (internal use)
UserSchema = {
  id: string (uuid),
  householdId: string (uuid),
  email: string (email format),
  name: string,
  avatarUrl: string | null,
  authProvider: 'google' | 'apple' | 'email',
  createdAt: string (ISO datetime),
  updatedAt: string (ISO datetime)
}

// Public user (excludes sensitive fields, sent to client)
PublicUserSchema = pick(UserSchema, [id, householdId, email, name, avatarUrl])
```

**Why two schemas?**

- `UserSchema` includes `authProvider` which is internal
- `PublicUserSchema` is what we send to the client

---

### 2.2 Household schema

**File:** `packages/shared/src/schemas/household.ts`

```typescript
HouseholdSchema = {
  id: string (uuid),
  name: string,
  createdAt: string (ISO datetime),
  updatedAt: string (ISO datetime)
}
```

---

### 2.3 Invite schema

**File:** `packages/shared/src/schemas/invite.ts`

```typescript
InviteSchema = {
  id: string (uuid),
  householdId: string (uuid),
  email: string (email format),
  invitedBy: string (uuid),
  expiresAt: string (ISO datetime),
  usedAt: string | null,
  createdAt: string (ISO datetime)
}

// For POST /api/invites request body
CreateInviteSchema = {
  email: string (email format)
}
```

**Note:** `token` is intentionally excluded from InviteSchema - we don't want to expose tokens in API responses. Only the invite link contains the token.

---

### 2.4 Auth response types

**File:** `packages/shared/src/schemas/auth.ts`

```typescript
// Response from GET /api/auth/me
AuthMeResponseSchema = {
  user: PublicUserSchema,
  household: HouseholdSchema,
};
```

---

### 2.5 Update exports

**File:** `packages/shared/src/main.ts`

Export all new schemas and types.

---

## Phase 3: Server Services

### 3.1 Household service

**File:** `server/src/services/household.service.ts`

| Function                | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `createHousehold(name)` | Insert new household, return Household           |
| `findHouseholdById(id)` | Find household by UUID, return Household or null |

---

### 3.2 User service

**File:** `server/src/services/user.service.ts`

| Function                                     | Purpose                                             |
| -------------------------------------------- | --------------------------------------------------- |
| `findUserByProviderId(provider, providerId)` | Find existing OAuth user                            |
| `findUserById(id)`                           | Find user by UUID                                   |
| `findUserByEmail(email)`                     | Find user by email (for invite matching)            |
| `createUser(params)`                         | Insert new user with all fields                     |
| `toPublicUser(user)`                         | Convert User to PublicUser (strip sensitive fields) |

**Helper needed:** `mapRowToUser(row)` - Convert DB row (snake_case) to User object (camelCase)

---

### 3.3 Invite service

**File:** `server/src/services/invite.service.ts`

| Function                                      | Purpose                                               |
| --------------------------------------------- | ----------------------------------------------------- |
| `createInvite(householdId, email, invitedBy)` | Generate token, insert invite                         |
| `findValidInviteByToken(token)`               | Find unexpired, unused invite by token                |
| `findValidInviteByEmail(email)`               | Find valid invite for email (for auto-join on signup) |
| `markInviteAsUsed(id)`                        | Set used_at = NOW()                                   |
| `getHouseholdInvites(householdId)`            | List all invites for a household                      |

**Token generation:** `crypto.randomBytes(32).toString('hex')` = 64 character hex string

---

### 3.4 Google OAuth service

**File:** `server/src/services/google-oauth.service.ts`

| Function                      | Purpose                                                           |
| ----------------------------- | ----------------------------------------------------------------- |
| `getGoogleAuthUrl(state)`     | Build Google OAuth URL with client_id, redirect_uri, scope, state |
| `exchangeCodeForTokens(code)` | POST to Google token endpoint, get access_token + id_token        |
| `decodeIdToken(idToken)`      | Decode JWT to get user info (sub, email, name, picture)           |

**Google OAuth URLs:**

- Auth: `https://accounts.google.com/o/oauth2/v2/auth`
- Token: `https://oauth2.googleapis.com/token`

**Scopes needed:** `openid email profile`

**State parameter:** Random string stored in session, verified on callback to prevent CSRF

---

## Phase 4: Server Middleware & Routes

### 4.1 Attach session middleware

**File:** `server/src/app.ts`

Session middleware (`server/src/config/session.ts`) already exists but isn't attached to the app. Add it BEFORE routes:

```typescript
import { sessionMiddleware } from './config/session';

// In createApp(), before routes:
app.use(sessionMiddleware());
```

---

### 4.2 requireAuth middleware

**File:** `server/src/middleware/require-auth.ts`

```
Request → Check session.userId exists?
            │
            ├─ No → 401 Unauthorized
            │
            └─ Yes → Load user from DB
                        │
                        ├─ Not found → Destroy session, 401
                        │
                        └─ Found → Load household
                                    │
                                    └─ Attach req.user, req.household → next()
```

**Extends Express Request type:**

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
      household?: Household;
    }
  }
}
```

---

### 4.3 Auth routes

**File:** `server/src/routes/auth.routes.ts`

#### GET /api/auth/google

Initiates Google OAuth flow.

```
1. Generate random state string
2. Store state in session (session.oauthState = state)
3. Redirect to Google OAuth URL with state
```

#### GET /api/auth/google/callback

Handles Google's redirect after user authorizes.

```
1. Check for error param → redirect to /login?error=access_denied
2. Verify state matches session.oauthState → prevent CSRF
3. Exchange code for tokens
4. Decode id_token to get Google user info
5. Check email_verified → reject if false
6. Look up user by (provider='google', provider_id=sub)
   │
   ├─ User exists → Set session.userId, redirect to app
   │
   └─ User doesn't exist:
        │
        ├─ Check if email already exists with different provider
        │   └─ Yes → redirect to /login?error=email_exists
        │
        └─ Check for valid invite for this email
            │
            ├─ Invite exists → Join that household, mark invite used
            │
            └─ No invite → Create new household
            │
            └─ Create user → Set session.userId → redirect to app
```

#### POST /api/auth/logout

```
1. Destroy session
2. Clear 'sid' cookie
3. Return { success: true }
```

#### GET /api/auth/me (requires auth)

```
1. requireAuth middleware loads user + household
2. Return { user, household }
```

---

### 4.4 Invite routes

**File:** `server/src/routes/invite.routes.ts`

All routes require authentication.

#### GET /api/invites

List all invites for the user's household.

#### POST /api/invites

Create a new invite.

```
1. Validate body with CreateInviteSchema
2. Check email doesn't already have an account
3. Check no valid invite already exists for this email
4. Create invite with 7-day expiry
5. Return invite (without token - token only in email link)
```

---

### 4.5 Register routes

**File:** `server/src/routes/index.ts`

```typescript
import { authRouter } from './auth.routes';
import { inviteRouter } from './invite.routes';

apiRouter.use('/auth', authRouter);
apiRouter.use('/invites', inviteRouter);
```

---

## Phase 5: Client

### 5.1 Extend API wrapper

**File:** `client/src/lib/api.ts`

**Changes needed:**

1. Add `credentials: 'include'` to all fetch calls (sends cookies)
2. Add `apiPost<T, B>(path, body?)` function
3. Add `apiDelete<T>(path)` function

---

### 5.2 Auth context

**File:** `client/src/lib/auth-context.tsx`

Provides auth state to entire app via React Context + TanStack Query.

```
AuthProvider
  │
  ├─ useQuery(['auth', 'me']) → fetches /api/auth/me
  │
  ├─ Provides:
  │   ├─ user: PublicUser | null
  │   ├─ household: Household | null
  │   ├─ isLoading: boolean
  │   ├─ isAuthenticated: boolean
  │   └─ logout: () => Promise<void>
  │
  └─ useAuth() hook to consume context
```

**Important:** Don't treat 401 as an error - it just means not logged in.

---

### 5.3 Route guards

**File:** `client/src/components/route-guard.tsx`

| Component      | Purpose                                  |
| -------------- | ---------------------------------------- |
| `RequireAuth`  | Redirects to /login if not authenticated |
| `RequireGuest` | Redirects to / if already authenticated  |

Both show loading spinner while auth state is loading.

---

### 5.4 Protected layout route

**File:** `client/src/routes/_authenticated.tsx`

TanStack Router layout route (underscore prefix). All child routes require auth.

```typescript
// Wraps children with RequireAuth
function AuthenticatedLayout() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}
```

---

### 5.5 Login page

**File:** `client/src/routes/login.tsx`

- Wrapped in `RequireGuest` (redirects if already logged in)
- Shows Google sign-in button
- Handles error query params from OAuth callback
- Button triggers `window.location.href = '/api/auth/google'`

---

### 5.6 Update root layout

**File:** `client/src/routes/__root.tsx`

- Import and use `useAuth()` hook
- Show user avatar + name + logout button when authenticated
- Show "Sign In" link when not authenticated

---

### 5.7 Move index under authenticated layout

**File:** `client/src/routes/_authenticated/index.tsx`

Move/rename the index route to be a child of the authenticated layout. This makes the home page protected.

---

## Key Files Summary

| File                          | Action                       |
| ----------------------------- | ---------------------------- |
| `server/src/app.ts`           | Add session middleware       |
| `server/src/routes/index.ts`  | Register auth, invite routes |
| `packages/shared/src/main.ts` | Export new schemas           |
| `client/src/lib/api.ts`       | Add credentials, apiPost     |
| `client/src/main.tsx`         | Wrap with AuthProvider       |

## Env Vars (Already Configured)

- `SESSION_SECRET` - 32+ char secret for signing session cookies
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `GOOGLE_REDIRECT_URL` - e.g., `http://localhost:3000/api/auth/google/callback`
- `APP_ORIGIN` - e.g., `http://localhost:5173` (where to redirect after auth)
