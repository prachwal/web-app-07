import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { cn } from '@/lib/utils';

/**
 * Error page rendered by React Router's `errorElement`.
 * Displays HTTP status codes or a generic fallback message.
 *
 * @returns The error page element
 */
export function ErrorPage(): React.JSX.Element {
  const error = useRouteError();

  let status = 'Error';
  let message = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    status = String(error.status);
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-6xl font-bold text-muted-foreground">{status}</p>
      <h1 className="text-2xl font-semibold text-foreground">{message}</h1>
      <Link
        to="/"
        className={cn(
          'rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground',
          'hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        )}
      >
        Wróć do strony głównej
      </Link>
    </div>
  );
}
