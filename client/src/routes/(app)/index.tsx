import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Landing Page - App Overview</div>;
}
