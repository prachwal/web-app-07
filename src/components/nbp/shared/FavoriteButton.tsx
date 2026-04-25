import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FavoriteButtonProps {
  code: string;
  isFavorite: boolean;
  onToggle: (code: string) => void;
  /** Render as absolute-positioned overlay (tiles), or inline (grid row). */
  variant?: 'overlay' | 'inline';
  className?: string;
}

/**
 * Star toggle button for marking a currency as favourite.
 * Shared by NbpGrid rows and NbpTiles cards.
 */
export function FavoriteButton({
  code,
  isFavorite,
  onToggle,
  variant = 'inline',
  className,
}: FavoriteButtonProps): React.JSX.Element {
  const { t } = useTranslation('nbp');

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? t('tiles.removeFavorite', { code })
          : t('tiles.addFavorite', { code })
      }
      onClick={(e) => {
        e.stopPropagation();
        onToggle(code);
      }}
      className={cn(
        'rounded transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        variant === 'overlay'
          ? 'absolute right-2 top-2 p-0.5'
          : 'p-1.5 touch-manipulation sm:p-0.5',
        isFavorite
          ? 'text-amber-500'
          : variant === 'overlay'
            ? 'text-muted-foreground/40 sm:opacity-0 sm:group-hover:opacity-100'
            : 'text-muted-foreground/40 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100',
        className,
      )}
    >
      <Star
        size={variant === 'overlay' ? 13 : 11}
        fill={isFavorite ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
    </button>
  );
}
