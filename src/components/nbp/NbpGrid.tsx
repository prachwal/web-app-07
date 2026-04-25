import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw, BarChart2, Star, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import * as logger from '@/lib/logger';
import { useAppSelector } from '@/store';
import { selectVisibleColumns } from '@/store/slices/tableSettingsSlice';
import { CurrencyName } from '@/components/nbp/shared/CurrencyName';
import type { NbpRate, NbpRateC, NbpGoldPrice, NbpTab } from '@/store/api/nbpApi';

const SKELETON_ROWS = 8;
const PAGE_SIZE = 20;

/** Props for the {@link NbpGrid} component. */
export interface NbpGridProps {
  /** Callback fired when the user wants to open the column/settings modal for this group. */
  onOpenSettings?: () => void;
  /** Currently active data tab. */
  tab: NbpTab;
  /** Exchange rate rows to display (for tabs A and B). */
  rates?: NbpRate[];
  /** Buy/sell rate rows to display (for tab C). */
  ratesC?: NbpRateC[];
  /** Gold price rows to display (for the gold tab). */
  goldPrices?: NbpGoldPrice[];
  /** True on initial load when no cached data is available. */
  isLoading: boolean;
  /** True when a background refetch is in progress (data already shown). */
  isFetching: boolean;
  /** API error, if any. */
  error?: unknown;
  /** Currently selected rate code (for Table A/B). */
  selectedCode?: string | null;
  /** Currently selected gold date. */
  selectedGoldDate?: string | null;
  /** Callback fired when a rate row is clicked. */
  onRateSelect: (rate: NbpRate) => void;
  /** Callback fired when a gold row is clicked. */
  onGoldSelect: (price: NbpGoldPrice) => void;
  /** Callback fired when the user requests a retry after an error. */
  onRetry: () => void;
  /**
   * Optional callback fired when the user clicks the chart icon on a currency row.
   * When provided, a small chart icon appears on hover for each currency row.
   */
  onViewChart?: (code: string) => void;
  /** Set of favourite currency codes / gold dates. */
  favorites?: string[];
  /** Callback fired when the user toggles a favourite. */
  onToggleFavorite?: (code: string) => void;
  /** Current pagination page (1-based). */
  page?: number;
  /** Callback fired when the user changes the page. */
  onPageChange?: (page: number) => void;
}


function SkeletonRow({ cols }: { cols: number }): React.JSX.Element {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Data grid for the NBP page.
 * Renders exchange rates (tabs A/B) or gold prices in a responsive table.
 *
 * Anti-flicker strategy:
 * – skeleton rows on first load (`isLoading`)
 * – opacity fade during background refetch (`isFetching`)
 * – previous data stays visible until new data arrives
 *
 * @param props - {@link NbpGridProps}
 * @returns The data grid element
 */
export function NbpGrid({
  tab,
  rates = [],
  ratesC = [],
  goldPrices = [],
  isLoading,
  isFetching,
  error,
  selectedCode,
  selectedGoldDate,
  onRateSelect,
  onGoldSelect,
  onRetry,
  onViewChart,
  favorites = [],
  onToggleFavorite,
  page = 1,
  onPageChange,
  onOpenSettings,
}: NbpGridProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const isGold = tab === 'gold';
  const isTableC = tab === 'C';

  /* ── per-group column visibility from Redux ── */
  const visibleColumnsAB = useAppSelector(selectVisibleColumns(isTableC ? 'C' : tab === 'gold' ? 'gold' : tab));
  const visibleAB = (col: string) => visibleColumnsAB.includes(col as never);

  const cols = isGold ? 2 : isTableC ? 4 : 3;
  const hasData = isGold ? goldPrices.length > 0 : isTableC ? ratesC.length > 0 : rates.length > 0;

  /* ── sort: favourites first (not applicable to gold tab) ── */
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

  // Gold rows are time-series entries — date-based keys are not meaningful favorites
  const sortedGold = [...goldPrices];

  /* ── pagination ── */
  const totalItems = isGold ? sortedGold.length : isTableC ? sortedRatesC.length : sortedRates.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;

  const pageRates = sortedRates.slice(offset, offset + PAGE_SIZE);
  const pageRatesC = sortedRatesC.slice(offset, offset + PAGE_SIZE);
  const pageGold = sortedGold.slice(offset, offset + PAGE_SIZE);

  /* ── visible column count for skeletons ── */
  const visibleCols = isGold
    ? visibleColumnsAB.length
    : isTableC
      ? visibleColumnsAB.length
      : visibleColumnsAB.length;

  /* ── error state ── */
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

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border transition-opacity duration-200',
        isFetching && !isLoading && 'opacity-60',
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-busy={isLoading || isFetching}>
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              {isGold ? (
                <>
                    {visibleAB('date') && (
                      <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                        {t('grid.date')}
                      </th>
                    )}
                    {visibleAB('price') && (
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-medium text-muted-foreground"
                      >
                        {t('grid.price')}
                      </th>
                    )}
                  </>
                ) : isTableC ? (
                  <>
                    <th scope="col" className="px-4 py-3 font-medium text-muted-foreground w-20">
                      {t('grid.code')}
                    </th>
                    {visibleAB('currency') && (
                      <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                        {t('grid.currency')}
                      </th>
                    )}
                    {visibleAB('bid') && (
                      <th scope="col" className="px-4 py-3 text-right font-medium text-muted-foreground">
                        <span className="hidden sm:inline">{t('grid.bid')}</span>
                        <span className="sm:hidden">Buy</span>
                      </th>
                    )}
                    {visibleAB('ask') && (
                      <th scope="col" className="px-4 py-3 text-right font-medium text-muted-foreground">
                        <span className="hidden sm:inline">{t('grid.ask')}</span>
                        <span className="sm:hidden">Sell</span>
                      </th>
                    )}
                    <th scope="col" className="w-8 px-2 py-3">
                      {onOpenSettings && (
                        <button
                          type="button"
                          onClick={onOpenSettings}
                          aria-label={t('grid.settings')}
                          title={t('grid.settings')}
                          className="rounded p-1 text-muted-foreground/50 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <Settings2 size={14} aria-hidden="true" />
                        </button>
                      )}
                    </th>
                  </>
                ) : (
                  <>
                    <th scope="col" className="px-4 py-3 font-medium text-muted-foreground w-20">
                      {t('grid.code')}
                    </th>
                    {visibleAB('currency') && (
                      <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                        {t('grid.currency')}
                      </th>
                    )}
                    {visibleAB('mid') && (
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-medium text-muted-foreground"
                      >
                        <span className="hidden sm:inline">{t('grid.mid')}</span>
                        <span className="sm:hidden">Mid</span>
                      </th>
                    )}
                    <th scope="col" className="w-8 px-2 py-3">
                      {onOpenSettings && (
                        <button
                          type="button"
                          onClick={onOpenSettings}
                          aria-label={t('grid.settings')}
                          title={t('grid.settings')}
                          className="rounded p-1 text-muted-foreground/50 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <Settings2 size={14} aria-hidden="true" />
                        </button>
                      )}
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* skeleton rows while initial loading */}
              {isLoading &&
                Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <SkeletonRow key={i} cols={visibleCols + (isGold ? 0 : 1)} />
                ))}

              {/* gold price rows */}
              {!isLoading &&
                isGold &&
                pageGold.map((entry) => (
                  <tr
                    key={entry.data}
                    onClick={() => onGoldSelect(entry)}
                    onKeyDown={(e) => e.key === 'Enter' && onGoldSelect(entry)}
                    role="row"
                    tabIndex={0}
                    aria-selected={selectedGoldDate === entry.data}
                    className={cn(
                      'group cursor-pointer transition-colors hover:bg-muted/50',
                      'focus-visible:outline-none focus-visible:bg-muted/50',
                      selectedGoldDate === entry.data && 'bg-primary/5',
                    )}
                  >
                    {visibleAB('date') && (
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {entry.data}
                      </td>
                    )}
                    {visibleAB('price') && (
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {entry.cena.toFixed(2)}
                      </td>
                    )}
                  </tr>
                ))}

              {/* exchange rate rows (A / B) */}
              {!isLoading &&
                !isGold &&
                !isTableC &&
                pageRates.map((rate) => {
                  const isFav = favorites.includes(rate.code);
                  return (
                    <tr
                      key={rate.code}
                      onClick={() => onRateSelect(rate)}
                      onKeyDown={(e) => e.key === 'Enter' && onRateSelect(rate)}
                      role="row"
                      tabIndex={0}
                      aria-selected={selectedCode === rate.code}
                      className={cn(
                        'group cursor-pointer transition-colors hover:bg-muted/50',
                        'focus-visible:outline-none focus-visible:bg-muted/50',
                        selectedCode === rate.code && 'bg-primary/5',
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                        <span className="flex items-center gap-2">
                          {rate.code}
                          {onToggleFavorite && (
                            <button
                              type="button"
                              aria-pressed={isFav}
                              aria-label={isFav ? t('tiles.removeFavorite', { code: rate.code }) : t('tiles.addFavorite', { code: rate.code })}
                              onClick={(e) => { e.stopPropagation(); onToggleFavorite(rate.code); }}
                              className={cn(
                                'rounded p-1.5 touch-manipulation transition-colors sm:p-0.5',
                                'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                isFav
                                  ? 'text-amber-500'
                                  : 'text-muted-foreground/40 sm:opacity-0 sm:group-hover:opacity-100',
                              )}
                            >
                              <Star size={11} fill={isFav ? 'currentColor' : 'none'} aria-hidden="true" />
                            </button>
                          )}
                          {onViewChart && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onViewChart(rate.code); }}
                              aria-label={t('grid.chartFor', { code: rate.code })}
                              title={t('grid.chartFor', { code: rate.code })}
                              className={cn(
                                'rounded p-1.5 touch-manipulation text-muted-foreground/40 transition-opacity sm:p-0.5',
                                'hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                'sm:opacity-0 sm:group-hover:opacity-100',
                              )}
                            >
                              <BarChart2 size={12} aria-hidden="true" />
                            </button>
                          )}
                        </span>
                      </td>
                      {visibleAB('currency') && (
                        <td className="px-4 py-3 text-muted-foreground">
                          <CurrencyName name={rate.currency} />
                        </td>
                      )}
                      {visibleAB('mid') && (
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {rate.mid.toFixed(4)}
                        </td>
                      )}
                      <td className="w-8 px-2 py-3" />
                    </tr>
                  );
                })}

              {/* exchange rate rows (C — bid/ask) */}
              {!isLoading &&
                isTableC &&
                pageRatesC.map((rate) => {
                  const isFav = favorites.includes(rate.code);
                  return (
                    <tr
                      key={rate.code}
                      role="row"
                      className="group transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                        <span className="flex items-center gap-2">
                          {rate.code}
                          {onToggleFavorite && (
                            <button
                              type="button"
                              aria-pressed={isFav}
                              aria-label={isFav ? t('tiles.removeFavorite', { code: rate.code }) : t('tiles.addFavorite', { code: rate.code })}
                              onClick={() => onToggleFavorite(rate.code)}
                              className={cn(
                                'rounded p-1.5 touch-manipulation transition-colors sm:p-0.5',
                                'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                isFav
                                  ? 'text-amber-500'
                                  : 'text-muted-foreground/40 sm:opacity-0 sm:group-hover:opacity-100',
                              )}
                            >
                              <Star size={11} fill={isFav ? 'currentColor' : 'none'} aria-hidden="true" />
                            </button>
                          )}
                          {onViewChart && (
                            <button
                              type="button"
                              onClick={() => onViewChart(rate.code)}
                              aria-label={t('grid.chartFor', { code: rate.code })}
                              title={t('grid.chartFor', { code: rate.code })}
                              className={cn(
                                'rounded p-1.5 touch-manipulation text-muted-foreground/40 transition-opacity sm:p-0.5',
                                'hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                'sm:opacity-0 sm:group-hover:opacity-100',
                              )}
                            >
                              <BarChart2 size={12} aria-hidden="true" />
                            </button>
                          )}
                        </span>
                      </td>
                      {visibleAB('currency') && (
                        <td className="px-4 py-3 text-muted-foreground">
                          <CurrencyName name={rate.currency} />
                        </td>
                      )}
                      {visibleAB('bid') && (
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {rate.bid.toFixed(4)}
                        </td>
                      )}
                      {visibleAB('ask') && (
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {rate.ask.toFixed(4)}
                        </td>
                      )}
                      <td className="w-8 px-2 py-3" />
                    </tr>
                  );
                })}

              {/* empty state */}
              {!isLoading && !hasData && (() => {
                logger.debug('NbpGrid: no data', { tab });
                return (
                  <tr>
                    <td colSpan={cols} className="px-4 py-16 text-center text-sm text-muted-foreground">
                      {t('grid.noData')}
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>

        {onPageChange && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            className="mt-4"
          />
        )}
      </div>
    );
  }
