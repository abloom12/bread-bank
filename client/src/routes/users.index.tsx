import { createFileRoute } from '@tanstack/react-router';
import { UsersListPage } from '../features/users/UsersListPage';

export const Route = createFileRoute('/users/')({
  component: UsersListPage,
});
