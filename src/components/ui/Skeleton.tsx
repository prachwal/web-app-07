import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
  /** Rounded pill shape (for avatars / badges). Default: rounded-md */
  pill?: boolean;
}

/**
 * Generic animated skeleton placeholder.
 * Compose multiples to match the target layout.
 */
export function Skeleton({ className, pill }: SkeletonProps): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-muted',
        pill ? 'rounded-full' : 'rounded-md',
        className,
      )}
    />
  );
}

/** Pre-built skeleton for a single table row (code | name | value). */
export function SkeletonTableRow({ cols = 3 }: { cols?: number }): React.JSX.Element {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** Pre-built skeleton for a currency tile card. */
export function SkeletonTileCard(): React.JSX.Element {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-2 h-6 w-20" />
    </div>
  );
}

/** Pre-built skeleton for the chart area. */
export function SkeletonChart(): React.JSX.Element {
  return (
    <div
      aria-busy="true"
      aria-label="Ładowanie wykresu…"
      className="h-72 animate-pulse rounded-2xl border border-border bg-muted/50 sm:h-80"
    />
  );
}
