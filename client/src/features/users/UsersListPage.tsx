import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchUsersList } from './users-api';
import { Route } from '../../routes/users';

export function UsersListPage() {
  const { q, page } = Route.useSearch();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', { q: q ?? '', page }],
    queryFn: () => fetchUsersList({ q, page }),
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Users list is having a moment.</div>;
  if (!data) return null;

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div>
      <h2>Users</h2>

      <div style={{ marginBottom: 12 }}>
        <div>
          <strong>Search:</strong> {q ?? '(none)'}
        </div>
        <div>
          <strong>Page:</strong> {page} / {totalPages}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Link
          to="/users"
          search={{ q, page: prevPage }}
        >
          Prev
        </Link>
        <Link
          to="/users"
          search={{ q, page: nextPage }}
        >
          Next
        </Link>
        <Link
          to="/users"
          search={{ page: 1 }}
        >
          Clear search
        </Link>
        <Link
          to="/users"
          search={{ q: 'user1', page: 1 }}
        >
          Try q=user1
        </Link>
      </div>

      <ul style={{ display: 'grid', gap: 8 }}>
        {data.items.map(u => (
          <li key={u.id}>
            <Link
              to="/users/$userId"
              params={{ userId: u.id }}
              search={{ q, page }}
            >
              {u.name}
            </Link>{' '}
          </li>
        ))}
      </ul>

      {data.items.length === 0 && <div>No users match that search.</div>}
    </div>
  );
}
