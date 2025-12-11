import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { parseOptionalString, parsePage } from '../lib/search-params';

type UsersSearch = {
  q?: string;
  page: number;
};

export const Route = createFileRoute('/users')({
  validateSearch: (search: Record<string, unknown>): UsersSearch => {
    const q = parseOptionalString(search.q);
    const page = parsePage(search.page, 1);
    return { q, page };
  },
  component: UsersLayout,
});

function UsersLayout() {
  const { q, page } = Route.useSearch();

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <h2 style={{ marginRight: 12 }}>Users</h2>
        <Link
          to="/users"
          search={{ q, page }}
        >
          List
        </Link>
        <Link
          to="/users/new"
          search={{ q, page }}
        >
          New
        </Link>
      </div>

      <div style={{ marginTop: 12 }}>
        <Outlet />
      </div>
    </div>
  );
}

// If those all work, your nested structure is good.
// /users
// /users?q=user1&page=1
// /users/3
// /users/new
