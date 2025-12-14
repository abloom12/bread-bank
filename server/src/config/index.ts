import { env, isProd } from './env';

export const config = {
  port: env.PORT,

  corsOrigin: env.CORS_ORIGIN.split(',')
    .map(s => s.trim())
    .filter(Boolean),

  isProd,

  sessionSecret: env.SESSION_SECRET,

  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUrl: env.GOOGLE_REDIRECT_URL,
  },

  appOrigin: env.APP_ORIGIN,
} as const;
