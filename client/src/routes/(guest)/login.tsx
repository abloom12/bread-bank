import { createFileRoute } from '@tanstack/react-router';

import { LoginForm } from '@/features/auth/LoginForm';

export const Route = createFileRoute('/(guest)/login')({
  component: LoginRoute,
});

function LoginRoute() {
  return <LoginForm />;
}
