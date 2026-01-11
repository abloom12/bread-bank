const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    list: (filters?: { role?: string }) => ['users', 'list', filters] as const,
  },
} as const;

export { queryKeys };
