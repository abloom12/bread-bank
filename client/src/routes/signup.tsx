import { createFileRoute } from '@tanstack/react-router';

import { SignupForm } from '@/features/auth/SignupForm';

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SignupForm />
    </div>
  );
}
