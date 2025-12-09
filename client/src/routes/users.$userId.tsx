import { createFileRoute } from '@tanstack/react-router';
import { UserDetailPage } from '../features/users/UsersDetailPage';

export const Route = createFileRoute('/users/$userId')({
  component: UserDetailPage,
});
