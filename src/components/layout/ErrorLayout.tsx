import { Link } from 'react-router';
import { cn } from '@/lib/utils';

export interface ErrorLayoutProps {
  status: string;
  message: string;
  linkLabel: string;
  linkTo?: string;
}

/**
 * Centered full-screen error layout shared by ErrorPage and NotFoundPage.
 */
export function ErrorLayout({
  status,
  message,
  linkLabel,
  linkTo = '/',
}: ErrorLayoutProps): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center text-foreground">
      <p className="text-6xl font-bold text-muted-foreground">{status}</p>
      <h1 className="text-2xl font-semibold text-foreground">{message}</h1>
      <Link
        to={linkTo}
        className={cn(
          'rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground',
          'hover:opacity-90 transition-opacity',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        )}
      >
        {linkLabel}
      </Link>
    </main>
  );
}
