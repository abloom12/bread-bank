import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { fetchUserById } from './users-api';
import { Route } from '../../routes/users.$userId';

export function UserDetailPage() {
  const { userId } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserById(userId),
  });

  if (isLoading) return <div>Loading user...</div>;
  if (error) return <div>User detail failed politely.</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.name}</h2>

      <div style={{ marginTop: 12 }}>
        <Link
          to=".."
          search={{ page: 1 }}
        >
          Back to users
        </Link>
      </div>
    </div>
  );
}
