import { createAuthClient } from 'better-auth/react';

// TODO: set baseURL from env
export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
});
