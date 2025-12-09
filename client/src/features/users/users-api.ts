import { MOCK_USERS, type User } from './mock-users';

const PAGE_SIZE = 10;

export type UsersListResult = {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
  q?: string;
};

export async function fetchUsersList(params: {
  q?: string;
  page: number;
}): Promise<UsersListResult> {
  // simulate network latency
  await new Promise(r => setTimeout(r, 150));

  const { q, page } = params;

  const filtered =
    q ?
      MOCK_USERS.filter(u => `${u.name}`.toLowerCase().includes(q.toLowerCase()))
    : MOCK_USERS;

  const total = filtered.length;
  const start = (page - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    q,
  };
}

export async function fetchUserById(userId: string): Promise<User> {
  await new Promise(r => setTimeout(r, 120));

  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}
