import { Router } from 'express';
import { env } from '../config/env';
import { requireAuth } from '../middleware/require-auth';
import { findOrCreateUserFromOAuth, getMe } from '../features/auth/auth.services';
import {
  buildGoogleAuthUrl,
  getGoogleProfileFromCode,
  parseGoogleCallbackQuery,
} from '../features/auth/providers/google';

export const authRouter = Router();

// Start Google login
authRouter.get('/auth/google', (req, res) => {
  const state = crypto.randomUUID();
  req.session.oauthState = state;
  res.redirect(buildGoogleAuthUrl(state));
});

// Google callback
authRouter.get('/auth/google/callback', async (req, res, next) => {
  try {
    const { code, state } = parseGoogleCallbackQuery(req.query);

    if (!req.session.oauthState || req.session.oauthState !== state) {
      return res.status(400).send('Invalid state');
    }

    const profile = await getGoogleProfileFromCode(code);
    const user = await findOrCreateUserFromOAuth(profile);

    req.session.regenerate(err => {
      if (err) return next(err);
      req.session.userId = user.id;
      res.redirect(env.APP_ORIGIN);
    });
  } catch (err) {
    next(err);
  }
});

// Logout
authRouter.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ data: true });
  });
});

// Who am I?
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const me = await getMe(req.session.userId!);
    res.json({ data: me });
  } catch (err) {
    next(err);
  }
});
