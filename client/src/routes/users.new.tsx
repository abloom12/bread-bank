import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/users/new')({
  component: UsersNewRoute,
});

function UsersNewRoute() {
  return (
    <div>
      <h3>New User</h3>
      <p>Placeholder route. Form comes later when we feel like suffering.</p>

      <Link
        to="/users"
        search={{ page: 1 }}
      >
        Back to users
      </Link>
    </div>
  );
}
