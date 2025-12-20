import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export function HealthPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['api-health'],
    queryFn: () => apiGet<{ ok: boolean }>('/api/health'),
  });

  if (isLoading) return <div>Checking API pulse...</div>;
  if (error) return <div>API is grumpy.</div>;

  return (
    <div>
      <h2>API Health</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
