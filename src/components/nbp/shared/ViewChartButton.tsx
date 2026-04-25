import { useTranslation } from 'react-i18next';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ViewChartButtonProps {
  code: string;
  onViewChart: (code: string) => void;
  /** 'row' = compact inline for table rows, 'tile' = with label for cards */
  variant?: 'row' | 'tile';
  className?: string;
}

/**
 * Button that switches the view to chart mode for a given currency.
 * Shared by NbpGrid and NbpTiles.
 */
export function ViewChartButton({
  code,
  onViewChart,
  variant = 'row',
  className,
}: ViewChartButtonProps): React.JSX.Element {
  const { t } = useTranslation('nbp');

  if (variant === 'tile') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onViewChart(code);
        }}
        aria-label={t('grid.chartFor', { code })}
        className={cn(
          'mt-1 flex items-center gap-1 self-start rounded text-xs text-muted-foreground/60',
          'transition-opacity hover:text-primary',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'sm:opacity-0 sm:group-hover:opacity-100',
          className,
        )}
      >
        <BarChart2 size={11} aria-hidden="true" />
        {t('tiles.showChart')}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onViewChart(code);
      }}
      aria-label={t('grid.chartFor', { code })}
      title={t('grid.chartFor', { code })}
      className={cn(
        'rounded p-1.5 touch-manipulation text-muted-foreground/40 transition-opacity sm:p-0.5',
        'hover:text-primary',
        'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'sm:opacity-0 sm:group-hover:opacity-100',
        className,
      )}
    >
      <BarChart2 size={12} aria-hidden="true" />
    </button>
  );
}
