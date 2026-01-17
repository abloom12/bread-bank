import { createAuthClient } from 'better-auth/react';
import { adminClient, organizationClient } from 'better-auth/client/plugins';

import { env } from '@/config/env';

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  plugins: [adminClient(), organizationClient()],
  fetchOptions: {
    onError: context => {
      const { response } = context;

      // Global: redirect on expired session (not on login page)
      if (response?.status === 401 && !window.location.pathname.includes('/login')) {
        // window.location.href = '/login';
      }

      // Global: rate limit toast
      if (response?.status === 429) {
        // toast.error('Too many attempts. Please wait.');
      }

      // Error still propagates to component for local handling
    },
  },
});
