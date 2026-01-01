import { createFileRoute } from '@tanstack/react-router';
import { SignupForm } from '@/features/auth/SignupForm';

export const Route = createFileRoute('/_auth/signup')({
  component: SignupRoute,
});

function SignupRoute() {
  return <SignupForm />;
}
