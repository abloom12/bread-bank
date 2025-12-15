import { env, isProd } from './env';

export const config = {
  appOrigin: env.APP_ORIGIN,
  corsOrigin: env.CORS_ORIGIN.split(',')
    .map(s => s.trim())
    .filter(Boolean),
  port: env.PORT,
  sessionSecret: env.SESSION_SECRET,
  isProd,
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUrl: env.GOOGLE_REDIRECT_URL,
  },
  database: {
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    name: env.DB_NAME,
    port: env.DB_PORT,
  },
} as const;
