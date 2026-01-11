import { QueryClient } from '@tanstack/react-query';

import { ApiRequestError } from './api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (
          error instanceof ApiRequestError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Optional: disable if annoying during dev
    },
    mutations: {
      retry: false,
    },
  },
});

export { queryClient };
