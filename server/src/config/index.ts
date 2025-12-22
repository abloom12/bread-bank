import { env, isProd } from './env';

export const config = {
  appOrigin: env.APP_ORIGIN,
  corsOrigin: env.CORS_ORIGIN.split(',')
    .map(s => s.trim())
    .filter(Boolean),
  port: env.PORT,
  isProd,
  database: {
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    name: env.DB_NAME,
    port: env.DB_PORT,
  },
  auth: {
    baseUrl: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
  },
} as const;
