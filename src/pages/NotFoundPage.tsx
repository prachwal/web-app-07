import { Link } from 'react-router';
import { cn } from '@/lib/utils';

/**
 * 404 Not Found page shown when no route matches.
 *
 * @returns The 404 error page element
 */
export function NotFoundPage(): React.JSX.Element {
  return (
    <main
      className={cn(
        'flex min-h-screen flex-col items-center justify-center gap-6',
        'bg-background text-foreground',
      )}
    >
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground text-lg">Page not found.</p>
      <Link
        to="/"
        className={cn(
          'rounded-lg bg-primary px-6 py-2 text-primary-foreground',
          'hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2',
          'transition-opacity',
        )}
      >
        Go home
      </Link>
    </main>
  );
}
