# Auth Flow Server Implementation

## Notes: Plan Corrections & Assumptions

1. **Invite schema typo**: The shared schema `packages/shared/src/schemas/invite.ts` uses `inviteBy` but the database column is `invited_by`. The correct camelCase should be `invitedBy`. The existing schema file has this typo - implementation will map from `invited_by` to `invitedBy` correctly, but the shared schema should be fixed separately.

2. **Invite token type**: The plan specifies a 64-character hex string for tokens, but the migration uses UUID type with `gen_random_uuid()` default. Implementation follows the actual database schema (UUID).

3. **Database config key**: The `config.database` object uses `name` for the database name, but `pg.Pool` expects `database`. The implementation corrects this when passing to the pool.

4. **AppError import path**: The existing `validate.ts` middleware imports from `../errors/AppError` but the file is at `../lib/AppError`. Implementation uses the correct path (`../lib/AppError`).

5. **User schema includes providerId**: The plan's Phase 2.1 omitted `providerId` from UserSchema, but the actual shared schema correctly includes it. Implementation matches the actual schema.

---

## server/src/services/household.service.ts

```typescript
import pool from '../db/db';
import type { Household } from '@app/shared';

interface HouseholdRow {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

function mapRowToHousehold(row: HouseholdRow): Household {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function createHousehold(name: string): Promise<Household> {
  const result = await pool.query<HouseholdRow>(
    `INSERT INTO households (name) VALUES ($1) RETURNING *`,
    [name]
  );
  return mapRowToHousehold(result.rows[0]);
}

export async function findHouseholdById(id: string): Promise<Household | null> {
  const result = await pool.query<HouseholdRow>(
    `SELECT * FROM households WHERE id = $1`,
    [id]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapRowToHousehold(result.rows[0]);
}
```

---

## server/src/services/user.service.ts

```typescript
import pool from '../db/db';
import type { User, PublicUser } from '@app/shared';

interface UserRow {
  id: string;
  household_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  auth_provider: 'google' | 'apple' | 'email';
  provider_id: string;
  created_at: Date;
  updated_at: Date;
}

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    householdId: row.household_id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
    authProvider: row.auth_provider,
    providerId: row.provider_id,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    householdId: user.householdId,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  };
}

export async function findUserByProviderId(
  provider: 'google' | 'apple' | 'email',
  providerId: string
): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT * FROM users WHERE auth_provider = $1 AND provider_id = $2`,
    [provider, providerId]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapRowToUser(result.rows[0]);
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapRowToUser(result.rows[0]);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapRowToUser(result.rows[0]);
}

export interface CreateUserParams {
  householdId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  authProvider: 'google' | 'apple' | 'email';
  providerId: string;
}

export async function createUser(params: CreateUserParams): Promise<User> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (household_id, email, name, avatar_url, auth_provider, provider_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      params.householdId,
      params.email,
      params.name,
      params.avatarUrl,
      params.authProvider,
      params.providerId,
    ]
  );
  return mapRowToUser(result.rows[0]);
}
```

---

## server/src/services/invite.service.ts

```typescript
import pool from '../db/db';
import type { Invite } from '@app/shared';

interface InviteRow {
  id: string;
  household_id: string;
  email: string;
  token: string;
  invited_by: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

// Note: The shared Invite type uses 'inviteBy' but should be 'invitedBy'.
// This maps correctly from DB snake_case to the intended camelCase.
function mapRowToInvite(row: InviteRow): Invite {
  return {
    id: row.id,
    householdId: row.household_id,
    email: row.email,
    // Maps to 'inviteBy' to match the current shared schema (typo)
    // If the shared schema is fixed to 'invitedBy', update this key
    inviteBy: row.invited_by,
    expiresAt: row.expires_at.toISOString(),
    usedAt: row.used_at ? row.used_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}

// Internal type that includes the token (not exposed in API responses)
export interface InviteWithToken extends Invite {
  token: string;
}

function mapRowToInviteWithToken(row: InviteRow): InviteWithToken {
  return {
    ...mapRowToInvite(row),
    token: row.token,
  };
}

const INVITE_EXPIRY_DAYS = 7;

export async function createInvite(
  householdId: string,
  email: string,
  invitedBy: string
): Promise<InviteWithToken> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  // Token is auto-generated by the database (gen_random_uuid())
  const result = await pool.query<InviteRow>(
    `INSERT INTO invites (household_id, email, invited_by, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [householdId, email, invitedBy, expiresAt]
  );
  return mapRowToInviteWithToken(result.rows[0]);
}

export async function findValidInviteByToken(
  token: string
): Promise<InviteWithToken | null> {
  const result = await pool.query<InviteRow>(
    `SELECT * FROM invites
     WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
    [token]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapRowToInviteWithToken(result.rows[0]);
}

export async function findValidInviteByEmail(
  email: string
): Promise<InviteWithToken | null> {
  const result = await pool.query<InviteRow>(
    `SELECT * FROM invites
     WHERE email = $1 AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapRowToInviteWithToken(result.rows[0]);
}

export async function markInviteAsUsed(id: string): Promise<void> {
  await pool.query(
    `UPDATE invites SET used_at = NOW() WHERE id = $1`,
    [id]
  );
}

export async function getHouseholdInvites(householdId: string): Promise<Invite[]> {
  const result = await pool.query<InviteRow>(
    `SELECT * FROM invites WHERE household_id = $1 ORDER BY created_at DESC`,
    [householdId]
  );
  return result.rows.map(mapRowToInvite);
}

export async function findPendingInviteByEmail(
  email: string,
  householdId: string
): Promise<Invite | null> {
  const result = await pool.query<InviteRow>(
    `SELECT * FROM invites
     WHERE email = $1 AND household_id = $2 AND used_at IS NULL AND expires_at > NOW()`,
    [email, householdId]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapRowToInvite(result.rows[0]);
}
```

---

## server/src/services/google-oauth.service.ts

```typescript
import { config } from '../config';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export interface GoogleUserInfo {
  sub: string; // Google's unique user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.redirectUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<GoogleTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.google.redirectUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

export function decodeIdToken(idToken: string): GoogleUserInfo {
  // JWT structure: header.payload.signature
  // We only need to decode the payload (no verification needed as we just got it from Google)
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid ID token format');
  }

  const payload = parts[1];
  // Base64url decode
  const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
  return JSON.parse(decoded);
}
```

---

## server/src/middleware/require-auth.ts

```typescript
import type { RequestHandler } from 'express';
import type { PublicUser, Household } from '@app/shared';
import { findUserById, toPublicUser } from '../services/user.service';
import { findHouseholdById } from '../services/household.service';
import { AppError } from '../lib/AppError';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
      household?: Household;
    }
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await findUserById(userId);

    if (!user) {
      // User no longer exists, destroy the stale session
      req.session.destroy(() => {});
      throw new AppError('Unauthorized', 401);
    }

    const household = await findHouseholdById(user.householdId);

    if (!household) {
      // Household no longer exists (shouldn't happen due to CASCADE, but handle it)
      req.session.destroy(() => {});
      throw new AppError('Unauthorized', 401);
    }

    req.user = toPublicUser(user);
    req.household = household;

    next();
  } catch (error) {
    next(error);
  }
};
```

---

## server/src/routes/auth.routes.ts

```typescript
import { Router } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../middleware/async-handler';
import { requireAuth } from '../middleware/require-auth';
import { config } from '../config';
import { sendSuccess } from '../lib/api-response';
import { AppError } from '../lib/AppError';
import {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  decodeIdToken,
} from '../services/google-oauth.service';
import {
  findUserByProviderId,
  findUserByEmail,
  createUser,
  toPublicUser,
} from '../services/user.service';
import { createHousehold } from '../services/household.service';
import {
  findValidInviteByEmail,
  markInviteAsUsed,
} from '../services/invite.service';

export const authRouter = Router();

// GET /api/auth/google - Initiate Google OAuth flow
authRouter.get(
  '/google',
  asyncHandler(async (req, res) => {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    req.session.oauthState = state;

    const authUrl = getGoogleAuthUrl(state);
    res.redirect(authUrl);
  })
);

// GET /api/auth/google/callback - Handle Google OAuth callback
authRouter.get(
  '/google/callback',
  asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;

    // Handle OAuth errors
    if (error) {
      return res.redirect(`${config.appOrigin}/login?error=access_denied`);
    }

    // Verify state to prevent CSRF
    if (!state || state !== req.session.oauthState) {
      return res.redirect(`${config.appOrigin}/login?error=invalid_state`);
    }

    // Clear the OAuth state from session
    delete req.session.oauthState;

    if (!code || typeof code !== 'string') {
      return res.redirect(`${config.appOrigin}/login?error=missing_code`);
    }

    try {
      // Exchange authorization code for tokens
      const tokens = await exchangeCodeForTokens(code);

      // Decode the ID token to get user info
      const googleUser = decodeIdToken(tokens.id_token);

      // Verify email is verified
      if (!googleUser.email_verified) {
        return res.redirect(`${config.appOrigin}/login?error=email_not_verified`);
      }

      // Check if user already exists with this Google account
      let user = await findUserByProviderId('google', googleUser.sub);

      if (user) {
        // Existing user - log them in
        req.session.userId = user.id;
        return res.redirect(config.appOrigin);
      }

      // New user - check if email exists with a different provider
      const existingUserWithEmail = await findUserByEmail(googleUser.email);
      if (existingUserWithEmail) {
        return res.redirect(`${config.appOrigin}/login?error=email_exists`);
      }

      // Check for a valid invite for this email
      const invite = await findValidInviteByEmail(googleUser.email);

      let householdId: string;

      if (invite) {
        // Join the inviter's household
        householdId = invite.householdId;
        await markInviteAsUsed(invite.id);
      } else {
        // Create a new household for this user
        const household = await createHousehold(`${googleUser.name}'s Household`);
        householdId = household.id;
      }

      // Create the new user
      user = await createUser({
        householdId,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture || null,
        authProvider: 'google',
        providerId: googleUser.sub,
      });

      // Log them in
      req.session.userId = user.id;
      return res.redirect(config.appOrigin);
    } catch (err) {
      console.error('OAuth callback error:', err);
      return res.redirect(`${config.appOrigin}/login?error=auth_failed`);
    }
  })
);

// POST /api/auth/logout - Log out the current user
authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    return new Promise<void>((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
        res.clearCookie('sid');
        sendSuccess(res, { success: true });
        resolve();
      });
    });
  })
);

// GET /api/auth/me - Get current user and household
authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    // requireAuth middleware ensures user and household are set
    sendSuccess(res, {
      user: req.user!,
      household: req.household!,
    });
  })
);
```

---

## server/src/routes/invite.routes.ts

```typescript
import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { requireAuth } from '../middleware/require-auth';
import { validate } from '../middleware/validate';
import { sendSuccess } from '../lib/api-response';
import { AppError } from '../lib/AppError';
import { CreateInviteSchema } from '@app/shared';
import { findUserByEmail } from '../services/user.service';
import {
  createInvite,
  getHouseholdInvites,
  findPendingInviteByEmail,
} from '../services/invite.service';

export const inviteRouter = Router();

// All invite routes require authentication
inviteRouter.use(requireAuth);

// GET /api/invites - List all invites for the user's household
inviteRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const invites = await getHouseholdInvites(req.household!.id);
    sendSuccess(res, invites);
  })
);

// POST /api/invites - Create a new invite
inviteRouter.post(
  '/',
  validate(CreateInviteSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body as { email: string };

    // Check if email already has an account
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new AppError('A user with this email already exists', 400);
    }

    // Check if a valid invite already exists for this email in this household
    const existingInvite = await findPendingInviteByEmail(email, req.household!.id);
    if (existingInvite) {
      throw new AppError('An active invite already exists for this email', 400);
    }

    // Create the invite
    const invite = await createInvite(
      req.household!.id,
      email,
      req.user!.id
    );

    // Return invite without token (token only in email/link)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, ...inviteWithoutToken } = invite;
    sendSuccess(res, inviteWithoutToken, 201);
  })
);
```

---

## server/src/routes/index.ts

```typescript
import { Router } from 'express';

import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';
import { inviteRouter } from './invite.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/invites', inviteRouter);
```

---

## server/src/app.ts

```typescript
import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { config } from './config';
import { apiRouter } from './routes';
import { sessionMiddleware } from './middleware/session';

import { AppError } from './lib/AppError';

export const createApp = () => {
  const app = express();

  // app level config
  app.disable('x-powered-by');

  // logging
  app.use(morgan('combined'));

  // body parsing
  app.use(express.json({ limit: '1mb' }));

  // secuirity headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  // rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // CORS
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (config.corsOrigin.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  // Session middleware - MUST be before routes
  app.use(sessionMiddleware());

  // routes
  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      data: null,
      error: {
        message: 'Not Found',
      },
    });
  });

  // error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        data: null,
        error: {
          message: err.message,
        },
      });
    }

    if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({
        data: null,
        error: {
          message: err.message,
        },
      });
    }

    console.error(err);

    return res.status(500).json({
      data: null,
      error: {
        message: 'Internal Server Error',
      },
    });
  });

  return app;
};
```

---

## server/src/middleware/validate.ts (fix import path)

```typescript
import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../lib/AppError';

type Target = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodType<unknown>, target: Target = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return next(
        new AppError(
          `Validation error: ${result.error.issues
            .map(issue => {
              const path = issue.path.join('.') || '(root)';
              return `${path}: ${issue.message}`;
            })
            .join('; ')}`,
          400,
        ),
      );
    }

    Object.assign(req, { [target]: result.data });
    next();
  };
```

---

## server/src/db/db.ts (fix database config key)

```typescript
import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({
  user: config.database.user,
  password: config.database.password,
  host: config.database.host,
  database: config.database.name, // Pool expects 'database', not 'name'
  port: config.database.port,
});

export default pool;
```

---

## packages/shared/src/schemas/invite.ts (fix typo - inviteBy -> invitedBy)

```typescript
import { z } from 'zod';

export const InviteSchema = z.object({
  id: z.uuid(),
  householdId: z.uuid(),
  email: z.email(),
  invitedBy: z.uuid(), // Fixed: was 'inviteBy'
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  usedAt: z.iso.datetime().nullable(),
});

export const CreateInviteSchema = z.object({
  email: z.email(),
});

export type Invite = z.infer<typeof InviteSchema>;
```

---

## Summary of Files Created/Modified

| File | Action |
|------|--------|
| `server/src/services/household.service.ts` | Created |
| `server/src/services/user.service.ts` | Created |
| `server/src/services/invite.service.ts` | Created |
| `server/src/services/google-oauth.service.ts` | Created |
| `server/src/middleware/require-auth.ts` | Created |
| `server/src/routes/auth.routes.ts` | Created |
| `server/src/routes/invite.routes.ts` | Created |
| `server/src/routes/index.ts` | Modified (add auth/invite routes) |
| `server/src/app.ts` | Modified (add session middleware) |
| `server/src/middleware/validate.ts` | Modified (fix import path) |
| `server/src/db/db.ts` | Modified (fix Pool config) |
| `packages/shared/src/schemas/invite.ts` | Modified (fix inviteBy typo) |
