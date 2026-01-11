import { Outlet, Link, createRootRoute, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

function RootLayout() {
  const isLoading = useRouterState({ select: s => s.isLoading });

  return (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}

function NotFound() {
  return (
    <div>
      <h2>404</h2>
      <p>That route does not exist. Your URL is doing freelance work.</p>
      {/* <Link to="/">Go home</Link> */}
    </div>
  );
}

function RootError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Unknown error';

  return (
    <div>
      <h2>Something broke</h2>
      <p>{message}</p>
      {/* <Link to="/">Back to safety</Link> */}
    </div>
  );
}
