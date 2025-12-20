import session from 'express-session';
import { env, isProd } from '../config/env';

export function sessionMiddleware() {
  return session({
    name: 'sid',
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd, // requires HTTPS in prod
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  });
}

// Session typing
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    oauthState?: string;
  }
}
