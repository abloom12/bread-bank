import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import pool from '../db/db';

export const auth = betterAuth({
  database: pool,
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  plugins: [organization()],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
