# Better-Auth Implementation Plan

## Overview

Integrate better-auth with email/password authentication into the Express 5 server. Replaces express-session with better-auth's built-in session management.

**Configuration:**
- Email/password authentication enabled
- Email verification required (console logging for development)
- Custom `household_id` field on users

---

## Files to Create

### 1. `server/src/features/auth/auth.ts`

Main better-auth configuration:

```typescript
import { betterAuth } from 'better-auth';
import pool from '../../db/db';
import { config } from '../../config';

export const auth = betterAuth({
  database: pool,
  secret: config.auth.secret,
  baseURL: config.appOrigin,
  trustedOrigins: config.corsOrigin,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      // Dev: console log verification emails
      console.log('========================================');
      console.log('EMAIL VERIFICATION');
      console.log(`To: ${user.email}`);
      console.log(`Verification URL: ${url}`);
      console.log(`Token: ${token}`);
      console.log('========================================');
    },
    autoSignInAfterVerification: true,
  },

  user: {
    additionalFields: {
      householdId: {
        type: 'string',
        required: false,
        fieldName: 'household_id',
        returned: true,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh every 24 hours
  },

  advanced: {
    cookiePrefix: 'bread_bank',
  },
});

export type Auth = typeof auth;
```

### 2. `server/src/features/auth/auth.middleware.ts`

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

### 3. `server/src/features/auth/auth.types.ts`

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

### 4. `server/src/features/auth/index.ts`

Module exports:

```typescript
export { auth } from './auth';
export { requireAuth, optionalAuth } from './auth.middleware';
export type { Session, User } from './auth.types';
```

### 5. `server/src/db/migrations/002_create-better-auth-tables.ts`

Database schema for better-auth:

```typescript
import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  // User table (better-auth standard + custom household_id)
  pgm.createTable('user', {
    id: { type: 'text', primaryKey: true },
    name: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true, unique: true },
    email_verified: { type: 'boolean', notNull: true, default: false },
    image: { type: 'text' },
    household_id: {
      type: 'uuid',
      references: 'households',
      onDelete: 'SET NULL',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('user', 'household_id');

  // Session table
  pgm.createTable('session', {
    id: { type: 'text', primaryKey: true },
    user_id: { type: 'text', notNull: true, references: 'user', onDelete: 'CASCADE' },
    token: { type: 'text', notNull: true, unique: true },
    expires_at: { type: 'timestamptz', notNull: true },
    ip_address: { type: 'text' },
    user_agent: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('session', 'user_id');
  pgm.createIndex('session', 'token');

  // Account table (for credentials and OAuth providers)
  pgm.createTable('account', {
    id: { type: 'text', primaryKey: true },
    user_id: { type: 'text', notNull: true, references: 'user', onDelete: 'CASCADE' },
    account_id: { type: 'text', notNull: true },
    provider_id: { type: 'text', notNull: true },
    access_token: { type: 'text' },
    refresh_token: { type: 'text' },
    access_token_expires_at: { type: 'timestamptz' },
    refresh_token_expires_at: { type: 'timestamptz' },
    scope: { type: 'text' },
    id_token: { type: 'text' },
    password: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('account', 'user_id');

  // Verification table (email verification tokens)
  pgm.createTable('verification', {
    id: { type: 'text', primaryKey: true },
    identifier: { type: 'text', notNull: true },
    value: { type: 'text', notNull: true },
    expires_at: { type: 'timestamptz', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('verification', 'identifier');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('verification');
  pgm.dropTable('account');
  pgm.dropTable('session');
  pgm.dropTable('user');
}
```

---

## Files to Modify

### 1. `server/src/config/env.ts`

Add `BETTER_AUTH_SECRET` to the Zod schema:

```typescript
const EnvSchema = z.object({
  // ... existing fields ...

  // Auth
  BETTER_AUTH_SECRET: z.string().min(32),
});
```

### 2. `server/src/config/index.ts`

Add auth config:

```typescript
export const config = {
  // ... existing config ...

  auth: {
    secret: env.BETTER_AUTH_SECRET,
  },
} as const;
```

### 3. `server/src/app.ts`

**Critical: Mount better-auth handler BEFORE `express.json()`**

```typescript
import { toNodeHandler } from 'better-auth/node';
import { auth } from './features/auth';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(morgan('combined'));

  app.use(helmet({ crossOriginResourcePolicy: false }));

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (config.corsOrigin.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }));

  // BETTER-AUTH HANDLER - MUST BE BEFORE express.json()
  app.all('/api/auth/{*splat}', toNodeHandler(auth));

  // Body parsing - AFTER better-auth handler
  app.use(express.json({ limit: '1mb' }));

  // ... rest of app ...
};
```

### 4. `server/.env.example`

Add:

```
# Auth
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long
```

### 5. `server/src/db/migrations/003_create-invites-table.ts`

Update to reference better-auth's `user` table:
- Change `invited_by` type from `uuid` to `text`
- Change FK reference from `users` to `user`

---

## Files to Delete

- `server/src/db/migrations/002_create-users-table.ts` (replaced by better-auth schema)

---

## Dependencies

```bash
# Install
npm install better-auth

# Remove after migration is complete
npm uninstall express-session @types/express-session
```

---

## Auth Endpoints (provided by better-auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register with email/password |
| POST | `/api/auth/sign-in/email` | Login |
| POST | `/api/auth/sign-out` | Logout |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/send-verification-email` | Resend verification email |
| GET | `/api/auth/verify-email` | Verify email (callback URL) |
| POST | `/api/auth/forget-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/ok` | Health check |

---

## Implementation Order

1. Install better-auth: `npm install better-auth`
2. Update env config (`env.ts`, `index.ts`, `.env.example`, `.env`)
3. Create auth feature module (`server/src/features/auth/`)
4. Update `app.ts` (import auth, add handler, move `express.json()`)
5. Delete old users migration (`002_create-users-table.ts`)
6. Create new better-auth migration (`002_create-better-auth-tables.ts`)
7. Update invites migration (`003_create-invites-table.ts`)
8. Run migrations
9. Test auth flow

---

## Testing

```bash
# Health check
curl http://localhost:3000/api/auth/ok

# Register
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# Check console for verification URL, then visit it

# Login
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"password123"}'

# Get session
curl http://localhost:3000/api/auth/session -b cookies.txt
```

---

## Key Gotchas

1. **Express 5 route syntax**: Use `{*splat}` not `*`
2. **Middleware order**: `express.json()` MUST come AFTER better-auth handler
3. **User IDs**: Better-auth uses `text` IDs, not `uuid`
4. **Table names**: Better-auth uses singular names (`user` not `users`)

---

## Future Enhancements

- Add Resend/SMTP for production email sending
- Add OAuth providers (Google, GitHub)
- Add password reset flow
- Add session management (view/revoke sessions)
