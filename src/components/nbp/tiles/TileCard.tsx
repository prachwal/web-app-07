import { cn } from '@/lib/utils';

export interface TileCardProps {
  isFavorite?: boolean;
  isGold?: boolean;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Clickable card shell shared by all tile variants (A/B, C, Gold).
 * Handles hover state, focus ring, and favourite highlight.
 */
export function TileCard({
  isFavorite,
  isGold,
  onClick,
  onKeyDown,
  ariaLabel,
  children,
  className,
}: TileCardProps): React.JSX.Element {
  return (
    <div
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={cn(
        'group relative flex flex-col gap-1 rounded-xl border bg-card p-4 transition-colors',
        isGold
          ? 'hover:border-amber-400/40 hover:bg-muted/30'
          : 'hover:border-primary/40 hover:bg-muted/30',
        onClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isFavorite && !isGold && 'border-amber-400/60 bg-amber-50/5',
        className,
      )}
    >
      {children}
    </div>
  );
}
