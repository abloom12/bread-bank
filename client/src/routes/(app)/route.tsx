import { createFileRoute, Outlet, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)')({
  beforeLoad: async () => {
    console.log('App layout route loaded');
    // You can add authentication checks or data fetching here
    // For example:
    // const session = await authClient.getSession()
    // if (session.data) {
    //   throw redirect({ to: '/login' });
    // }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div>
      <h1>Bread Bank</h1>

      <nav>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Outlet />
    </div>
  );
}
