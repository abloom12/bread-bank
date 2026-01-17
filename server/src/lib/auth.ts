import { betterAuth } from 'better-auth';
import { admin, haveIBeenPwned, organization, openAPI } from 'better-auth/plugins';
import pool from '../db/db';

// For production:
// Make sure trustedOrigins in your server auth config includes your production domain:
// trustedOrigins: [
//   process.env.APP_ORIGIN, // e.g., "https://yourdomain.com"
// ],

// Plugins to look into:
// captcha plugin
//

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
    maxPasswordLength: 128,
  },
  plugins: [admin(), organization(), haveIBeenPwned(), openAPI()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
