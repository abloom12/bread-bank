export type User = {
  id: string;
  name: string;
};

export const MOCK_USERS: User[] = Array.from({ length: 42 }).map((_, i) => {
  const n = i + 1;
  return {
    id: String(n),
    name: `User ${n}`,
  };
});
