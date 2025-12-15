import { z } from 'zod';

const EnvSchema = z.object({
  // App
  APP_ORIGIN: z.url(),
  CORS_ORIGIN: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive(),
  SESSION_SECRET: z.string().min(32),

  // Auth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URL: z.url(),

  // Database
  DB_USER: z.string().default('ash'),
  DB_PASSWORD: z.string().default(''),
  DB_HOST: z.string().default('localhost'),
  DB_NAME: z.string().default('bread_bank'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
});

export const env = EnvSchema.parse(process.env);
export const isProd = env.NODE_ENV === 'production';
