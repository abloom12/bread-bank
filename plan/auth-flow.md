# Auth Flow Implementation

Complete server-side code for authentication using the vertical slices + identity dependency layer pattern.

---

## 1. Identity Module (Dependency Layer)

### features/identity/repositories/user.repository.ts

```typescript
import pool from '../../../db/db';
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

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT * FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  );
  return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
}

export async function findUserByProviderId(
  provider: 'google' | 'apple' | 'email',
  providerId: string,
): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT * FROM users WHERE auth_provider = $1 AND provider_id = $2`,
    [provider, providerId],
  );
  return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
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
    ],
  );
  return mapRowToUser(result.rows[0]);
}
```

---

### features/identity/repositories/household.repository.ts

```typescript
import pool from '../../../db/db';
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

export async function findHouseholdById(id: string): Promise<Household | null> {
  const result = await pool.query<HouseholdRow>(
    `SELECT * FROM households WHERE id = $1`,
    [id],
  );
  return result.rows[0] ? mapRowToHousehold(result.rows[0]) : null;
}

export async function createHousehold(name: string): Promise<Household> {
  const result = await pool.query<HouseholdRow>(
    `INSERT INTO households (name) VALUES ($1) RETURNING *`,
    [name],
  );
  return mapRowToHousehold(result.rows[0]);
}
```

---

### features/identity/repositories/invite.repository.ts

```typescript
import pool from '../../../db/db';
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

function mapRowToInvite(row: InviteRow): Invite {
  return {
    id: row.id,
    householdId: row.household_id,
    email: row.email,
    token: row.token,
    invitedBy: row.invited_by,
    expiresAt: row.expires_at.toISOString(),
    usedAt: row.used_at ? row.used_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}

const INVITE_EXPIRY_DAYS = 7;

export async function createInvite(
  householdId: string,
  email: string,
  invitedBy: string,
): Promise<Invite> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const result = await pool.query<InviteRow>(
    `INSERT INTO invites (household_id, email, invited_by, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [householdId, email, invitedBy, expiresAt],
  );
  return mapRowToInvite(result.rows[0]);
}

export async function findValidInviteByToken(token: string): Promise<Invite | null> {
  const result = await pool.query<InviteRow>(
    `SELECT * FROM invites
     WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
    [token],
  );
  return result.rows[0] ? mapRowToInvite(result.rows[0]) : null;
}

export async function findValidInviteByEmail(email: string): Promise<Invite | null> {
  const result = await pool.query<InviteRow>(
    `SELECT * FROM invites
     WHERE email = $1 AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [email],
  );
  return result.rows[0] ? mapRowToInvite(result.rows[0]) : null;
}

export async function findPendingInviteByEmail(
  email: string,
  householdId: string,
): Promise<Invite | null> {
  const result = await pool.query<InviteRow>(
    `SELECT * FROM invites
     WHERE email = $1 AND household_id = $2 AND used_at IS NULL AND expires_at > NOW()`,
    [email, householdId],
  );
  return result.rows[0] ? mapRowToInvite(result.rows[0]) : null;
}

export async function markInviteAsUsed(id: string): Promise<void> {
  await pool.query(`UPDATE invites SET used_at = NOW() WHERE id = $1`, [id]);
}

export async function getHouseholdInvites(householdId: string): Promise<Invite[]> {
  const result = await pool.query<InviteRow>(
    `SELECT * FROM invites WHERE household_id = $1 ORDER BY created_at DESC`,
    [householdId],
  );
  return result.rows.map(mapRowToInvite);
}
```

---

### features/identity/identity.service.ts

```typescript
// Public API for identity operations
// Other features import from here, not directly from repositories

import * as userRepo from './repositories/user.repository';
import * as householdRepo from './repositories/household.repository';
import * as inviteRepo from './repositories/invite.repository';

// Re-export types
export type { CreateUserParams } from './repositories/user.repository';

// User operations
export const findUserById = userRepo.findUserById;
export const findUserByEmail = userRepo.findUserByEmail;
export const findUserByProviderId = userRepo.findUserByProviderId;
export const createUser = userRepo.createUser;
export const toPublicUser = userRepo.toPublicUser;

// Household operations
export const findHouseholdById = householdRepo.findHouseholdById;
export const createHousehold = householdRepo.createHousehold;

// Invite operations
export const createInvite = inviteRepo.createInvite;
export const findValidInviteByToken = inviteRepo.findValidInviteByToken;
export const findValidInviteByEmail = inviteRepo.findValidInviteByEmail;
export const findPendingInviteByEmail = inviteRepo.findPendingInviteByEmail;
export const markInviteAsUsed = inviteRepo.markInviteAsUsed;
export const getHouseholdInvites = inviteRepo.getHouseholdInvites;
```

---

### features/identity/index.ts

```typescript
// Public exports for the identity module
export * from './identity.service';
```

---

## 2. Auth Feature

### features/auth/google-oauth.ts

```typescript
import { config } from '../../config';

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

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
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
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid ID token format');
  }

  const payload = parts[1];
  const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
  return JSON.parse(decoded);
}
```

---

### features/auth/auth.routes.ts

```typescript
import { Router } from 'express';
import crypto from 'crypto';

import { asyncHandler } from '../../middleware/async-handler';
import { requireAuth } from '../../middleware/require-auth';
import { config } from '../../config';
import { sendSuccess } from '../../lib/api-response';

import { getGoogleAuthUrl, exchangeCodeForTokens, decodeIdToken } from './google-oauth';
import {
  findUserByProviderId,
  findUserByEmail,
  createUser,
  createHousehold,
  findValidInviteByEmail,
  markInviteAsUsed,
} from '../identity';

export const authRouter = Router();

// GET /api/auth/google - Initiate Google OAuth flow
authRouter.get(
  '/google',
  asyncHandler(async (req, res) => {
    const state = crypto.randomBytes(32).toString('hex');
    req.session.oauthState = state;

    const authUrl = getGoogleAuthUrl(state);
    res.redirect(authUrl);
  }),
);

// GET /api/auth/google/callback - Handle Google OAuth callback
authRouter.get(
  '/google/callback',
  asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${config.appOrigin}/login?error=access_denied`);
    }

    if (!state || state !== req.session.oauthState) {
      return res.redirect(`${config.appOrigin}/login?error=invalid_state`);
    }

    delete req.session.oauthState;

    if (!code || typeof code !== 'string') {
      return res.redirect(`${config.appOrigin}/login?error=missing_code`);
    }

    try {
      const tokens = await exchangeCodeForTokens(code);
      const googleUser = decodeIdToken(tokens.id_token);

      if (!googleUser.email_verified) {
        return res.redirect(`${config.appOrigin}/login?error=email_not_verified`);
      }

      // Check if user already exists with this Google account
      let user = await findUserByProviderId('google', googleUser.sub);

      if (user) {
        req.session.userId = user.id;
        return res.redirect(config.appOrigin);
      }

      // Check if email exists with a different provider
      const existingUserWithEmail = await findUserByEmail(googleUser.email);
      if (existingUserWithEmail) {
        return res.redirect(`${config.appOrigin}/login?error=email_exists`);
      }

      // Check for a valid invite
      const invite = await findValidInviteByEmail(googleUser.email);

      let householdId: string;

      if (invite) {
        householdId = invite.householdId;
        await markInviteAsUsed(invite.id);
      } else {
        const household = await createHousehold(`${googleUser.name}'s Household`);
        householdId = household.id;
      }

      user = await createUser({
        householdId,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture || null,
        authProvider: 'google',
        providerId: googleUser.sub,
      });

      req.session.userId = user.id;
      return res.redirect(config.appOrigin);
    } catch (err) {
      console.error('OAuth callback error:', err);
      return res.redirect(`${config.appOrigin}/login?error=auth_failed`);
    }
  }),
);

// POST /api/auth/logout
authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    return new Promise<void>(resolve => {
      req.session.destroy(err => {
        if (err) {
          console.error('Session destruction error:', err);
        }
        res.clearCookie('sid');
        sendSuccess(res, { success: true });
        resolve();
      });
    });
  }),
);

// GET /api/auth/me - Get current user and household
authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    sendSuccess(res, {
      user: req.user!,
      household: req.household!,
    });
  }),
);
```

---

## 3. Invite Feature

### features/invite/invite.routes.ts

```typescript
import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { requireAuth } from '../../middleware/require-auth';
import { validate } from '../../middleware/validate';
import { sendSuccess } from '../../lib/api-response';
import { AppError } from '../../lib/AppError';
import { CreateInviteSchema } from '@app/shared';

import {
  findUserByEmail,
  createInvite,
  getHouseholdInvites,
  findPendingInviteByEmail,
} from '../identity';

export const inviteRouter = Router();

// All invite routes require authentication
inviteRouter.use(requireAuth);

// GET /api/invites - List all invites for the user's household
inviteRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const invites = await getHouseholdInvites(req.household!.id);
    sendSuccess(res, invites);
  }),
);

// POST /api/invites - Create a new invite
inviteRouter.post(
  '/',
  validate(CreateInviteSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body as { email: string };

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new AppError('A user with this email already exists', 400);
    }

    const existingInvite = await findPendingInviteByEmail(email, req.household!.id);
    if (existingInvite) {
      throw new AppError('An active invite already exists for this email', 400);
    }

    const invite = await createInvite(req.household!.id, email, req.user!.id);
    sendSuccess(res, invite, 201);
  }),
);
```

---

## 4. Health Feature

### features/health/health.routes.ts

```typescript
import { Router } from 'express';
import { sendSuccess } from '../../lib/api-response';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  sendSuccess(res, { ok: true });
});
```

---

## 5. Shared Middleware

### middleware/require-auth.ts

```typescript
import type { RequestHandler } from 'express';
import type { PublicUser, Household } from '@app/shared';

import { findUserById, findHouseholdById, toPublicUser } from '../features/identity';
import { AppError } from '../lib/AppError';

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
      req.session.destroy(() => {});
      throw new AppError('Unauthorized', 401);
    }

    const household = await findHouseholdById(user.householdId);

    if (!household) {
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

## 6. Updated Files

### routes/index.ts

```typescript
import { Router } from 'express';

import { healthRouter } from '../features/health/health.routes';
import { authRouter } from '../features/auth/auth.routes';
import { inviteRouter } from '../features/invite/invite.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/invites', inviteRouter);
```

---

### app.ts

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

  app.disable('x-powered-by');

  app.use(morgan('combined'));

  app.use(express.json({ limit: '1mb' }));

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

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

  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      data: null,
      error: {
        message: 'Not Found',
      },
    });
  });

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

## File Creation Order

1. Create directories:
   ```
   mkdir -p server/src/features/identity/repositories
   mkdir -p server/src/features/auth
   mkdir -p server/src/features/invite
   mkdir -p server/src/features/health
   ```

2. Create identity module:
   - `features/identity/repositories/user.repository.ts`
   - `features/identity/repositories/household.repository.ts`
   - `features/identity/repositories/invite.repository.ts`
   - `features/identity/identity.service.ts`
   - `features/identity/index.ts`

3. Create features:
   - `features/auth/google-oauth.ts`
   - `features/auth/auth.routes.ts`
   - `features/invite/invite.routes.ts`
   - `features/health/health.routes.ts`

4. Create/update middleware:
   - `middleware/require-auth.ts`

5. Update existing:
   - `routes/index.ts`
   - `app.ts`

6. Remove old files:
   - `routes/health.routes.ts` (moved to features)
