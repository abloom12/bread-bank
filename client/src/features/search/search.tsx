import { Link } from '@tanstack/react-router';
import { Route } from '../../routes/search';

export function SearchPage() {
  const { q, page } = Route.useSearch();

  return (
    <div>
      <h2>Search Params Demo</h2>

      <div style={{ marginBottom: 12 }}>
        <div>
          <strong>q:</strong> {q ?? '(empty)'}
        </div>
        <div>
          <strong>page:</strong> {page ?? 1}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link
          to="/search"
          search={{ q: 'bagels', page: 1 }}
        >
          bagels p1
        </Link>
        <Link
          to="/search"
          search={{ q: 'bagels', page: 2 }}
        >
          bagels p2
        </Link>
        <Link
          to="/search"
          search={{ q: 'donuts', page: 1 }}
        >
          donuts p1
        </Link>
        <Link
          to="/search"
          search={{ page: 1 }}
        >
          clear q
        </Link>
      </div>
    </div>
  );
}
