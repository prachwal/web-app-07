import { useTranslation } from 'react-i18next';
import { Search, X, BarChart2, TableProperties } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NbpTab } from '@/store/api/nbpApi';

const TABS: { id: NbpTab; labelKey: string }[] = [
  { id: 'A', labelKey: 'tabs.tableA' },
  { id: 'B', labelKey: 'tabs.tableB' },
  { id: 'C', labelKey: 'tabs.tableC' },
  { id: 'gold', labelKey: 'tabs.gold' },
];

/** Props for the {@link NbpFilters} component. */
export interface NbpFiltersProps {
  /** Currently active data tab. */
  tab: NbpTab;
  /** Callback fired when the user switches tabs. */
  onTabChange: (tab: NbpTab) => void;
  /** Current search query (for Table A / B / C grid view). */
  search: string;
  /** Callback fired when the search input changes. */
  onSearchChange: (value: string) => void;
  /** Start date for gold price range or chart series date range (ISO 8601). */
  startDate: string;
  /** End date for gold price range or chart series date range (ISO 8601). */
  endDate: string;
  /** Callback fired when the start date changes. */
  onStartDateChange: (value: string) => void;
  /** Callback fired when the end date changes. */
  onEndDateChange: (value: string) => void;
  /** Callback fired when the user resets date filters. */
  onClear: () => void;
  /** Whether a tab transition is pending (React `useTransition`). */
  isPending?: boolean;
  /** Current view mode — grid table or line chart. */
  viewMode: 'grid' | 'chart';
  /** Callback fired when the user toggles the view mode. */
  onViewModeChange: (mode: 'grid' | 'chart') => void;
  /** Currency code for the historical series chart (e.g. "USD"). */
  chartCode: string;
  /** Callback fired when the chart currency code changes. */
  onChartCodeChange: (code: string) => void;
  /** Validation error message for the date range (93-day limit). Null when valid. */
  chartDateError: string | null;
  /**
   * List of currency codes available in the current table.
   * When provided, renders a datalist autocomplete on the currency input.
   */
  availableCodes?: string[];
}

/**
 * Filter bar for the NBP page.
 * Renders tab selector, a view-mode toggle, and context-sensitive controls:
 * – search input for exchange tables (A / B / C) in grid mode
 * – currency code input + date range for chart mode (A / B / C)
 * – date-range picker for gold prices (both modes)
 *
 * @param props - {@link NbpFiltersProps}
 * @returns The filter bar element
 */
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
}: NbpFiltersProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const showChart = viewMode === 'chart';

  return (
    <div className="flex flex-col gap-4">
      {/* ── Tab selector ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          role="tablist"
          aria-label={t('title')}
          className={cn(
            'flex gap-1 rounded-lg border border-border bg-muted/40 p-1',
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
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                tab === id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {/* ── View mode toggle (grid / chart) ── */}
        {(
          <div
            role="group"
            aria-label={showChart ? t('series.viewGrid') : t('series.viewChart')}
            className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1"
          >
            <button
              type="button"
              aria-pressed={!showChart}
              onClick={() => onViewModeChange('grid')}
              title={t('series.viewGrid')}
              aria-label={t('series.viewGrid')}
              className={cn(
                'rounded-md p-2 transition-colors',
                !showChart
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <TableProperties size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-pressed={showChart}
              onClick={() => onViewModeChange('chart')}
              title={t('series.viewChart')}
              aria-label={t('series.viewChart')}
              className={cn(
                'rounded-md p-2 transition-colors',
                showChart
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <BarChart2 size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* ── Search input — grid mode for A / B / C ── */}
      {tab !== 'gold' && !showChart && (
        <div className="relative">
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
      )}

      {/* ── Chart controls — currency code + date range for A / B / C ── */}
      {tab !== 'gold' && showChart && (
        <div className="flex flex-wrap items-end gap-3">
          {/* Currency code input */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t('series.selectCurrency')}
            </span>
            <input
              type="text"
              list="nbp-currency-codes"
              value={chartCode}
              onChange={(e) => onChartCodeChange(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="USD"
              maxLength={3}
              aria-label={t('series.selectCurrency')}
              className={cn(
                'w-24 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono uppercase',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            />
            {availableCodes.length > 0 && (
              <datalist id="nbp-currency-codes">
                {availableCodes.map((code) => (
                  <option key={code} value={code} />
                ))}
              </datalist>
            )}
          </label>

          {/* Start date */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t('filters.startDate')}
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              aria-label={t('filters.startDate')}
              className={cn(
                'rounded-md border border-border bg-background px-3 py-2 text-sm',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            />
          </label>

          {/* End date */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t('filters.endDate')}
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              aria-label={t('filters.endDate')}
              className={cn(
                'rounded-md border border-border bg-background px-3 py-2 text-sm',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            />
          </label>

          {/* Reset button */}
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'flex items-center gap-2 rounded-md border border-border px-3 py-2',
              'text-sm text-muted-foreground transition-colors hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <X size={14} aria-hidden="true" />
            {t('filters.clear')}
          </button>
        </div>
      )}

      {/* 93-day validation error */}
      {chartDateError && (
        <p role="alert" className="text-xs text-destructive">
          {chartDateError}
        </p>
      )}

      {/* ── Date range — gold (always visible) ── */}
      {tab === 'gold' && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t('filters.startDate')}
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              aria-label={t('filters.startDate')}
              className={cn(
                'rounded-md border border-border bg-background px-3 py-2 text-sm',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {t('filters.endDate')}
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              aria-label={t('filters.endDate')}
              className={cn(
                'rounded-md border border-border bg-background px-3 py-2 text-sm',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            />
          </label>
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'flex items-center gap-2 rounded-md border border-border px-3 py-2',
              'text-sm text-muted-foreground transition-colors hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <X size={14} aria-hidden="true" />
            {t('filters.clear')}
          </button>
        </div>
      )}
    </div>
  );
}
