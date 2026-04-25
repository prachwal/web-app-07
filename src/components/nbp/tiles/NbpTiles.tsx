import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import { useAppSelector } from '@/store';
import { selectGroupSettings } from '@/store/slices/tableSettingsSlice';
import { usePagination } from '@/lib/usePagination';
import { useFavoriteSorter } from '@/lib/useFavoriteSorter';
import { DataError } from '@/components/nbp/shared/DataError';
import { SkeletonTileCard } from '@/components/ui/Skeleton';
import { FavoriteButton } from '@/components/nbp/shared/FavoriteButton';
import { ViewChartButton } from '@/components/nbp/shared/ViewChartButton';
import { TileCard } from '@/components/nbp/tiles/TileCard';
import { TileGrid } from '@/components/nbp/tiles/TileGrid';
import type { NbpRate, NbpRateC, NbpGoldPrice, NbpTab } from '@/store/api/nbpApi';

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
  onRateSelect?: (rate: NbpRate) => void;
  onRateCSelect?: (rate: NbpRateC) => void;
  onGoldSelect?: (price: NbpGoldPrice) => void;
  onRetry: () => void;
  page: number;
  onPageChange: (page: number) => void;
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
  onRateSelect,
  onRateCSelect,
  onGoldSelect,
  onRetry,
  page,
  onPageChange,
}: NbpTilesProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const isGold = tab === 'gold';
  const isTableC = tab === 'C';
  const groupSettings = useAppSelector(selectGroupSettings(tab));
  const pageSize = groupSettings.layout.tileItemsPerPage;
  const tileColumns = groupSettings.layout.tileColumns;

  const sortedRates = useFavoriteSorter(rates, favorites);
  const sortedRatesC = useFavoriteSorter(ratesC, favorites);
  const activeItems: Array<NbpRate | NbpRateC | NbpGoldPrice> = isGold
    ? goldPrices
    : isTableC
      ? sortedRatesC
      : sortedRates;
  const { pageItems, safePage, totalPages } = usePagination(activeItems, page, pageSize);

  if (error) return <DataError onRetry={onRetry} />;

  if (isLoading) {
    return (
      <TileGrid tileColumns={tileColumns} ariaBusy ariaLabel={t('grid.loading')}>
        {Array.from({ length: pageSize }).map((_, i) => (
          <SkeletonTileCard key={i} />
        ))}
      </TileGrid>
    );
  }

  if (activeItems.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">{t('grid.noData')}</p>;
  }

  return (
    <div className={cn('flex flex-col gap-4', isFetching && !isLoading && 'opacity-60')}>
      <TileGrid tileColumns={tileColumns}>
        {/* Table A / B tiles */}
        {!isGold && !isTableC &&
          (pageItems as NbpRate[]).map((rate) => {
            const isFav = favorites.includes(rate.code);
            return (
              <TileCard
                key={rate.code}
                isFavorite={isFav}
                ariaLabel={`${rate.code} ${rate.currency}`}
                onClick={onRateSelect ? () => onRateSelect(rate) : undefined}
                onKeyDown={onRateSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') onRateSelect(rate); } : undefined}
              >
                <FavoriteButton
                  code={rate.code}
                  isFavorite={isFav}
                  onToggle={onToggleFavorite}
                  variant="overlay"
                />
                <span className="font-mono text-xs font-semibold text-foreground">{rate.code}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{rate.currency}</span>
                <span className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {rate.mid.toFixed(4)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">PLN</span>
                </span>
                {onViewChart && (
                  <ViewChartButton code={rate.code} onViewChart={onViewChart} variant="tile" />
                )}
              </TileCard>
            );
          })}

        {/* Table C tiles */}
        {!isGold && isTableC &&
          (pageItems as NbpRateC[]).map((rate) => {
            const isFav = favorites.includes(rate.code);
            return (
              <TileCard
                key={rate.code}
                isFavorite={isFav}
                ariaLabel={`${rate.code} ${rate.currency}`}
                onClick={onRateCSelect ? () => onRateCSelect(rate) : undefined}
                onKeyDown={onRateCSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') onRateCSelect(rate); } : undefined}
              >
                <FavoriteButton
                  code={rate.code}
                  isFavorite={isFav}
                  onToggle={onToggleFavorite}
                  variant="overlay"
                />
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
                  <ViewChartButton code={rate.code} onViewChart={onViewChart} variant="tile" />
                )}
              </TileCard>
            );
          })}

        {/* Gold tiles */}
        {isGold &&
          (pageItems as NbpGoldPrice[]).map((entry) => (
            <TileCard
              key={entry.data}
              isGold
              ariaLabel={`${t('grid.date')} ${entry.data}: ${entry.cena.toFixed(2)} PLN/g`}
              onClick={onGoldSelect ? () => onGoldSelect(entry) : undefined}
              onKeyDown={onGoldSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') onGoldSelect(entry); } : undefined}
            >
              <span className="font-mono text-xs text-muted-foreground">{entry.data}</span>
              <span className="mt-1 text-lg font-bold tabular-nums text-amber-600">
                {entry.cena.toFixed(2)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">PLN/g</span>
              </span>
            </TileCard>
          ))}
      </TileGrid>

      <Pagination page={safePage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
