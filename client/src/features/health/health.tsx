import { useQuery } from '@tanstack/react-query';

export function HealthPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return await res.json();
    },
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
