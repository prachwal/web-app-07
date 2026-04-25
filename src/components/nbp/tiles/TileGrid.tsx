import { cn } from '@/lib/utils';

export interface TileGridProps {
  tileColumns: number;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaBusy?: boolean;
  className?: string;
}

const COLUMN_CLASSES: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

/**
 * Responsive grid wrapper for currency tiles.
 * Accepts a `tileColumns` setting (2, 3, or 4) from user preferences.
 */
export function TileGrid({
  tileColumns,
  children,
  ariaLabel,
  ariaBusy,
  className,
}: TileGridProps): React.JSX.Element {
  const cols = COLUMN_CLASSES[tileColumns] ?? COLUMN_CLASSES[4];

  return (
    <div
      className={cn('grid gap-3', cols, className)}
      aria-busy={ariaBusy}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
