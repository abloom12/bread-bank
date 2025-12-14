import { z } from 'zod';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../../../config/env';
import type { OAuthProfile } from '../auth.types';

const GoogleCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export function parseGoogleCallbackQuery(query: unknown) {
  return GoogleCallbackQuerySchema.parse(query);
}

export function buildGoogleAuthUrl(state: string) {
  const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  u.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  u.searchParams.set('redirect_uri', env.GOOGLE_REDIRECT_URL);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', 'openid email profile');
  u.searchParams.set('state', state);
  return u.toString();
}

const GoogleIdTokenClaimsSchema = z.object({
  sub: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  iss: z.string().optional(),
  aud: z.union([z.string(), z.array(z.string())]).optional(),
});

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export async function getGoogleProfileFromCode(code: string): Promise<OAuthProfile> {
  // Exchange code -> tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URL,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }

  const tokenJson = (await tokenRes.json()) as { id_token: string };
  if (!tokenJson.id_token) throw new Error('Missing id_token from Google');

  // Verify ID token signature + claims
  const { payload } = await jwtVerify(tokenJson.id_token, JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: env.GOOGLE_CLIENT_ID,
  });

  const claims = GoogleIdTokenClaimsSchema.parse(payload);

  return {
    provider: 'google',
    providerUserId: claims.sub,
    email: claims.email ?? null,
    name: claims.name ?? null,
  };
}
