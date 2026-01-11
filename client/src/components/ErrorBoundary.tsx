import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/Button';

type FallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

type ErrorBoundaryProps = {
  children: React.ReactNode;
  onReset?: () => void;
};

function ErrorBoundary({ children, onReset }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export { ErrorBoundary, ErrorFallback };

//* Usage:
//* Wrap a section of your app
// <ErrorBoundary>
//   <SomeComponentThatMightThrow />
// </ErrorBoundary>

//* With reset callback
// <ErrorBoundary onReset={() => queryClient.clear()}>
//   <App />
// </ErrorBoundary>

//* Update __root.tsx
//* You can keep your RootError for route-level errors (TanStack Router handles those), and use ErrorBoundary for component-level errors:
// import { ErrorFallback } from '@/components/ErrorBoundary';
// export const Route = createRootRoute({
//   component: RootLayout,
//   notFoundComponent: NotFound,
//   errorComponent: ({ error }) => (
//     <ErrorFallback
//       error={error instanceof Error ? error : new Error('Unknown error')}
//       resetErrorBoundary={() => window.location.reload()}
//     />
//   ),
// });
