import { AlertCircle, RefreshCw, SearchX, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// ApiErrorState
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiErrorStateProps {
  /** Error heading. Defaults to a generic Polish message. */
  title?: string;
  /** Secondary description. */
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * Full-width error state for failed API calls.
 * Replaces the duplicated error blocks in NbpGrid, NbpTiles, NbpChart.
 */
export function ApiErrorState({
  title = 'Nie udało się załadować danych.',
  description,
  onRetry,
  retryLabel = 'Spróbuj ponownie',
  className,
}: ApiErrorStateProps): React.JSX.Element {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center',
        className,
      )}
    >
      <AlertCircle size={32} className="text-destructive" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-destructive">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm',
            'text-muted-foreground transition-colors hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <RefreshCw size={14} aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  /** 'search' shows a magnifier, 'inbox' shows an inbox icon, 'custom' uses children. */
  variant?: 'search' | 'inbox' | 'custom';
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Generic empty-state placeholder.
 * Use for no-results (search), no-data (inbox), or custom scenarios.
 */
export function EmptyState({
  variant = 'inbox',
  title = 'Brak danych',
  description,
  action,
  icon,
  className,
}: EmptyStateProps): React.JSX.Element {
  const Icon = variant === 'search' ? SearchX : Inbox;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 py-16 text-center text-muted-foreground',
        className,
      )}
    >
      {icon ?? <Icon size={32} className="opacity-40" aria-hidden="true" />}
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
