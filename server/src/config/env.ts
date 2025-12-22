import { z } from 'zod';

const EnvSchema = z.object({
  // App
  APP_ORIGIN: z.url(),
  CORS_ORIGIN: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive(),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),

  // Database
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.coerce.number().int().positive(),
});

export const env = EnvSchema.parse(process.env);
export const isProd = env.NODE_ENV === 'production';
