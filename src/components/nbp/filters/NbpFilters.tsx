import { useTranslation } from 'react-i18next';
import { Search, BarChart2, TableProperties, LayoutGrid, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/useBreakpoint';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import type { NbpTab } from '@/store/api/nbpApi';
import type { SortField } from '@/pages/NbpPage';

const TABS: { id: NbpTab; labelKey: string }[] = [
  { id: 'A', labelKey: 'tabs.tableA' },
  { id: 'B', labelKey: 'tabs.tableB' },
  { id: 'C', labelKey: 'tabs.tableC' },
  { id: 'gold', labelKey: 'tabs.gold' },
];

export interface NbpFiltersProps {
  tab: NbpTab;
  onTabChange: (tab: NbpTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear: () => void;
  isPending?: boolean;
  viewMode: 'grid' | 'chart' | 'tiles';
  onViewModeChange: (mode: 'grid' | 'chart' | 'tiles') => void;
  chartCode: string;
  onChartCodeChange: (code: string) => void;
  chartDateError: string | null;
  availableCodes?: string[];
  sortBy?: SortField;
  onSortByChange?: (sort: SortField) => void;
}

export function NbpFilters({
  tab,
  onTabChange,
  search,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  isPending = false,
  viewMode,
  onViewModeChange,
  chartCode,
  onChartCodeChange,
  chartDateError,
  availableCodes = [],
  sortBy = 'default',
  onSortByChange,
}: NbpFiltersProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar + view toggle */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label={t('title')}
            title={t('filters.tabsScrollHint')}
            className={cn(
              'flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-lg border border-border bg-muted/40 p-1',
              '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              'transition-opacity duration-150',
              isPending && 'opacity-70',
            )}
          >
            {TABS.map(({ id, labelKey }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                type="button"
                onClick={() => onTabChange(id)}
                className={cn(
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2',
                  tab === id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>

          <div
            role="group"
            aria-label={t('series.viewMode')}
            className="flex shrink-0 gap-1 rounded-lg border border-border bg-muted/40 p-1"
          >
            {(
              [
                { mode: 'grid', Icon: TableProperties, labelKey: 'series.viewGrid' },
                { mode: 'tiles', Icon: LayoutGrid, labelKey: 'series.viewTiles' },
                { mode: 'chart', Icon: BarChart2, labelKey: 'series.viewChart' },
              ] as const
            ).map(({ mode, Icon, labelKey }) => (
              <button
                key={mode}
                type="button"
                aria-pressed={viewMode === mode}
                onClick={() => onViewModeChange(mode)}
                title={t(labelKey)}
                aria-label={t(labelKey)}
                className={cn(
                  'rounded-md p-2 transition-colors',
                  viewMode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        {isMobile && (
          <p className="text-[11px] leading-none text-muted-foreground">
            {t('filters.tabsScrollHint')}
          </p>
        )}
      </div>

      {/* Search + sort (grid/tiles, non-gold) */}
      {tab !== 'gold' && viewMode !== 'chart' && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('filters.search')}
              aria-label={t('filters.search')}
              className={cn(
                'w-full rounded-md border border-border bg-background py-2 pl-9 pr-4 text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            />
          </div>
          {onSortByChange && (
            <div className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-border bg-background px-2">
              <ArrowUpDown size={16} className="text-muted-foreground" aria-hidden="true" />
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as SortField)}
                aria-label={t('filters.sortBy')}
                className={cn(
                  'h-full min-w-30 bg-transparent text-sm text-muted-foreground',
                  'dark:scheme-dark',
                  'focus:outline-none focus-visible:ring-0',
                )}
              >
                <option value="default">{t('filters.sortDefault')}</option>
                <option value="code">{t('filters.sortCode')}</option>
                {(tab === 'A' || tab === 'B') && <option value="mid">{t('filters.sortMid')}</option>}
                {tab === 'C' && <option value="bid">{t('filters.sortBid')}</option>}
                {tab === 'C' && <option value="ask">{t('filters.sortAsk')}</option>}
                <option value="favorites">{t('filters.sortFavorites')}</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Chart mode filters (non-gold) */}
      {tab !== 'gold' && viewMode === 'chart' && (
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t('series.selectCurrency')}
            </span>
            {availableCodes.length > 0 ? (
              <select
                value={chartCode}
                onChange={(e) => onChartCodeChange(e.target.value)}
                aria-label={t('series.selectCurrency')}
                className={cn(
                  'rounded-md border border-border bg-background px-3 py-2 text-sm font-mono',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isMobile ? 'w-[4.5rem]' : 'w-24',
                )}
              >
                {availableCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={chartCode}
                onChange={(e) => onChartCodeChange(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="USD"
                maxLength={3}
                aria-label={t('series.selectCurrency')}
                className={cn(
                  'rounded-md border border-border bg-background px-3 py-2 text-sm font-mono uppercase',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isMobile ? 'w-[4.5rem]' : 'w-24',
                )}
              />
            )}
          </div>

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            onClear={onClear}
            compact={isMobile}
            showLabels={!isMobile}
            clearVariant="destructive"
          />
        </div>
      )}

      {chartDateError && (
        <p role="alert" className="text-xs text-destructive">
          {chartDateError}
        </p>
      )}

      {/* Gold tab date range */}
      {tab === 'gold' && (
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          onClear={onClear}
          compact={isMobile}
          showLabels={!isMobile}
          clearVariant="neutral"
        />
      )}
    </div>
  );
}
