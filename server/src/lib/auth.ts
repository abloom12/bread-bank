import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import pool from '../db/db';

export const auth = betterAuth({
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [organization()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
