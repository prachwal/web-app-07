import { useTranslation } from 'react-i18next';
import { Star, BarChart2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import * as logger from '@/lib/logger';
import type { NbpRate, NbpRateC, NbpGoldPrice, NbpTab } from '@/store/api/nbpApi';

const PAGE_SIZE = 12;

export interface NbpTilesProps {
  tab: NbpTab;
  rates?: NbpRate[];
  ratesC?: NbpRateC[];
  goldPrices?: NbpGoldPrice[];
  isLoading: boolean;
  isFetching: boolean;
  error?: unknown;
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  onViewChart?: (code: string) => void;
  onRetry: () => void;
  page: number;
  onPageChange: (page: number) => void;
}

function SkeletonTile(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
    >
      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-6 w-24 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function NbpTiles({
  tab,
  rates = [],
  ratesC = [],
  goldPrices = [],
  isLoading,
  isFetching,
  error,
  favorites,
  onToggleFavorite,
  onViewChart,
  onRetry,
  page,
  onPageChange,
}: NbpTilesProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const isGold = tab === 'gold';
  const isTableC = tab === 'C';

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center"
      >
        <AlertCircle size={32} className="text-destructive" aria-hidden="true" />
        <p className="text-sm text-destructive">{t('errors.fetch')}</p>
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
          {t('errors.retry')}
        </button>
      </div>
    );
  }

  const sortedRates = [...rates].sort((a, b) => {
    const aFav = favorites.includes(a.code) ? 0 : 1;
    const bFav = favorites.includes(b.code) ? 0 : 1;
    return aFav - bFav;
  });

  const sortedRatesC = [...ratesC].sort((a, b) => {
    const aFav = favorites.includes(a.code) ? 0 : 1;
    const bFav = favorites.includes(b.code) ? 0 : 1;
    return aFav - bFav;
  });

  const sortedGold = [...goldPrices];

  const totalItems = isGold ? sortedGold.length : isTableC ? sortedRatesC.length : sortedRates.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;

  const pageRates = sortedRates.slice(offset, offset + PAGE_SIZE);
  const pageRatesC = sortedRatesC.slice(offset, offset + PAGE_SIZE);
  const pageGold = sortedGold.slice(offset, offset + PAGE_SIZE);

  if (isLoading) {
    return (
      <div>
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          aria-busy="true"
          aria-label={t('grid.loading')}
        >
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonTile key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    logger.debug('NbpTiles: no data', { tab });
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">{t('grid.noData')}</p>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', isFetching && !isLoading && 'opacity-60')}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {!isGold &&
          !isTableC &&
          pageRates.map((rate) => {
            const isFav = favorites.includes(rate.code);
            return (
              <div
                key={rate.code}
                className={cn(
                  'group relative flex flex-col gap-1 rounded-xl border bg-card p-4 transition-colors',
                  'hover:border-primary/40 hover:bg-muted/30',
                  isFav && 'border-amber-400/60 bg-amber-50/5',
                )}
              >
                <button
                  type="button"
                  aria-pressed={isFav}
                  aria-label={isFav ? t('tiles.removeFavorite', { code: rate.code }) : t('tiles.addFavorite', { code: rate.code })}
                  onClick={() => onToggleFavorite(rate.code)}
                  className={cn(
                    'absolute right-2 top-2 rounded p-0.5 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isFav
                      ? 'text-amber-500'
                      : 'text-muted-foreground/40 sm:opacity-0 sm:group-hover:opacity-100',
                  )}
                >
                  <Star size={13} fill={isFav ? 'currentColor' : 'none'} aria-hidden="true" />
                </button>

                <span className="font-mono text-xs font-semibold text-foreground">{rate.code}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{rate.currency}</span>
                <span className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {rate.mid.toFixed(4)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">PLN</span>
                </span>

                {onViewChart && (
                  <button
                    type="button"
                    onClick={() => onViewChart(rate.code)}
                    aria-label={t('grid.chartFor', { code: rate.code })}
                    className={cn(
                      'mt-1 flex items-center gap-1 self-start rounded text-xs text-muted-foreground/60',
                      'transition-opacity hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      'sm:opacity-0 sm:group-hover:opacity-100',
                    )}
                  >
                    <BarChart2 size={11} aria-hidden="true" />
                    {t('tiles.showChart')}
                  </button>
                )}
              </div>
            );
          })}

        {!isGold &&
          isTableC &&
          pageRatesC.map((rate) => {
            const isFav = favorites.includes(rate.code);
            return (
              <div
                key={rate.code}
                className={cn(
                  'group relative flex flex-col gap-1 rounded-xl border bg-card p-4 transition-colors',
                  'hover:border-primary/40 hover:bg-muted/30',
                  isFav && 'border-amber-400/60 bg-amber-50/5',
                )}
              >
                <button
                  type="button"
                  aria-pressed={isFav}
                  aria-label={isFav ? t('tiles.removeFavorite', { code: rate.code }) : t('tiles.addFavorite', { code: rate.code })}
                  onClick={() => onToggleFavorite(rate.code)}
                  className={cn(
                    'absolute right-2 top-2 rounded p-0.5 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isFav
                      ? 'text-amber-500'
                      : 'text-muted-foreground/40 sm:opacity-0 sm:group-hover:opacity-100',
                  )}
                >
                  <Star size={13} fill={isFav ? 'currentColor' : 'none'} aria-hidden="true" />
                </button>

                <span className="font-mono text-xs font-semibold text-foreground">{rate.code}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{rate.currency}</span>
                <div className="mt-1 flex gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{t('grid.bid')}</span>
                    <span className="text-sm font-bold tabular-nums text-green-600">{rate.bid.toFixed(4)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{t('grid.ask')}</span>
                    <span className="text-sm font-bold tabular-nums text-red-500">{rate.ask.toFixed(4)}</span>
                  </div>
                </div>

                {onViewChart && (
                  <button
                    type="button"
                    onClick={() => onViewChart(rate.code)}
                    aria-label={t('grid.chartFor', { code: rate.code })}
                    className={cn(
                      'mt-1 flex items-center gap-1 self-start rounded text-xs text-muted-foreground/60',
                      'transition-opacity hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      'sm:opacity-0 sm:group-hover:opacity-100',
                    )}
                  >
                    <BarChart2 size={11} aria-hidden="true" />
                    {t('tiles.showChart')}
                  </button>
                )}
              </div>
            );
          })}

        {isGold &&
          pageGold.map((entry) => {
            return (
              <div
                key={entry.data}
                className="group relative flex flex-col gap-1 rounded-xl border bg-card p-4 transition-colors hover:border-amber-400/40 hover:bg-muted/30"
              >
                <span className="font-mono text-xs text-muted-foreground">{entry.data}</span>
                <span className="mt-1 text-lg font-bold tabular-nums text-amber-600">
                  {entry.cena.toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">PLN/g</span>
                </span>
              </div>
            );
          })}
      </div>

      <Pagination page={safePage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
