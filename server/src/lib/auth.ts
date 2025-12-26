import { betterAuth } from 'better-auth';
import { admin, organization } from 'better-auth/plugins';
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
    minPasswordLength: 8,
    maxPasswordLength: 32,
  },
  plugins: [admin(), organization()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
