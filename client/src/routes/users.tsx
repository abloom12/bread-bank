import { createFileRoute } from '@tanstack/react-router';
import { UsersListPage } from '../features/users/UsersListPage';
import { parseOptionalString, parsePage } from '../lib/search-params';

type UsersSearch = {
  q?: string;
  page: number;
};

export const Route = createFileRoute('/users')({
  validateSearch: (search: Record<string, unknown>): UsersSearch => {
    const q = parseOptionalString(search.q);
    const page = parsePage(search.page, 1);
    return { q, page };
  },
  component: UsersListPage,
});
