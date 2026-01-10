import { createAuthClient } from 'better-auth/react';
import { env } from '@/config/env';

// TODO: set baseURL from env
export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
});
