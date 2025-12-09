import { createFileRoute } from '@tanstack/react-router';
import { SearchPage } from '../features/search/search';
import { parseOptionalString, parsePage } from '../lib/search-params';

type SearchParams = {
  q?: string;
  page?: number;
};

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const q = parseOptionalString(search.q);
    const page = parsePage(search.page, 1);
    return { q, page };
  },
  component: SearchPage,
});
