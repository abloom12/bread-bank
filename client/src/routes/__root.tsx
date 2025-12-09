import { Outlet, Link, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

function RootLayout() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Bread Bank</h1>

      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/health">Health</Link>
        <Link to="/search">Search</Link>
        <Link
          to="/users"
          search={{ q: 'user1', page: 1 }}
        >
          Users
        </Link>
      </nav>

      <Outlet />

      <TanStackRouterDevtools />
    </div>
  );
}

function NotFound() {
  return (
    <div>
      <h2>404</h2>
      <p>That route doesn’t exist. Your URL is doing freelance work.</p>
      <Link to="/">Go home</Link>
    </div>
  );
}

function RootError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Unknown error';

  return (
    <div>
      <h2>Something broke</h2>
      <p>{message}</p>
      <Link to="/">Back to safety</Link>
    </div>
  );
}
