import { createFileRoute, Outlet, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Bread Bank</h1>

      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/components">Components</Link>
        <Link to="/health">Health</Link>
      </nav>

      <Outlet />
    </div>
  );
}
