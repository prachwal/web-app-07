import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Props for the {@link Pagination} component. */
export interface PaginationProps {
  /** Current 1-based page number. */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Callback fired when the user selects a page. */
  onPageChange: (page: number) => void;
  /** Optional extra class names for the wrapper element. */
  className?: string;
}

/**
 * Accessible pagination control.
 * Renders prev/next buttons and page number buttons with keyboard support.
 *
 * @param props - {@link PaginationProps}
 * @returns The pagination element or null when there is only one page.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps): React.JSX.Element | null {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1 pb-4 sm:pb-0', className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm',
          'transition-colors hover:bg-muted/60',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-40',
        )}
      >
        <ChevronLeft size={14} aria-hidden="true" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={page === p ? 'page' : undefined}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border text-sm',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              page === p
                ? 'border-primary bg-primary text-primary-foreground font-medium'
                : 'border-border hover:bg-muted/60 text-foreground',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm',
          'transition-colors hover:bg-muted/60',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-40',
        )}
      >
        <ChevronRight size={14} aria-hidden="true" />
      </button>
    </nav>
  );
}

/** Build a compact page list with ellipsis for large page counts. */
function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}
