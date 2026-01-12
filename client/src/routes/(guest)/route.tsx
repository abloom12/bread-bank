import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(guest)')({
  beforeLoad: async () => {
    console.log('App layout route loaded');
    // You can add authentication checks or data fetching here
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
