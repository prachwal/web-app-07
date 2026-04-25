import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, BarChart2, TableProperties, LayoutGrid, Calendar, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/useBreakpoint';
import type { NbpTab } from '@/store/api/nbpApi';
import type { SortField } from '@/pages/NbpPage';

const TABS: { id: NbpTab; labelKey: string }[] = [
  { id: 'A', labelKey: 'tabs.tableA' },
  { id: 'B', labelKey: 'tabs.tableB' },
  { id: 'C', labelKey: 'tabs.tableC' },
  { id: 'gold', labelKey: 'tabs.gold' },
];

export interface CompactOptions {
  currency?: boolean;
  date?: boolean;
  reset?: boolean;
  labels?: boolean;
}

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
  compact?: CompactOptions;
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
  compact,
  sortBy = 'default',
  onSortByChange,
}: NbpFiltersProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const isMobile = useIsMobile();
  const compactDate     = compact?.date     ?? isMobile;
  const compactReset    = compact?.reset    ?? isMobile;
  const compactCurrency = compact?.currency ?? isMobile;
  const compactLabels   = compact?.labels   ?? isMobile;
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef   = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div
          role="tablist"
          aria-label={t('title')}
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
            <button
              type="button"
              aria-pressed={viewMode === 'grid'}
              onClick={() => onViewModeChange('grid')}
              title={t('series.viewGrid')}
              aria-label={t('series.viewGrid')}
              className={cn(
                'rounded-md p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <TableProperties size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-pressed={viewMode === 'tiles'}
              onClick={() => onViewModeChange('tiles')}
              title={t('series.viewTiles')}
              aria-label={t('series.viewTiles')}
              className={cn(
                'rounded-md p-2 transition-colors',
                viewMode === 'tiles'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutGrid size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-pressed={viewMode === 'chart'}
              onClick={() => onViewModeChange('chart')}
              title={t('series.viewChart')}
              aria-label={t('series.viewChart')}
              className={cn(
                'rounded-md p-2 transition-colors',
                viewMode === 'chart'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <BarChart2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

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
            <div className="flex shrink-0 items-center gap-1">
              <ArrowUpDown size={14} className="text-muted-foreground" aria-hidden="true" />
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as SortField)}
                aria-label={t('filters.sortBy')}
                className={cn(
                  'rounded-md border border-border bg-background py-2 pl-2 pr-6 text-sm',
                  'text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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

      {tab !== 'gold' && viewMode === 'chart' && (
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex flex-col gap-1">
            {!compactLabels && (
              <span className="text-xs font-medium text-muted-foreground">
                {t('series.selectCurrency')}
              </span>
            )}
            <input
              type="text"
              list="nbp-currency-codes"
              value={chartCode}
              onChange={(e) => onChartCodeChange(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="USD"
              maxLength={3}
              aria-label={t('series.selectCurrency')}
              className={cn(
                'rounded-md border border-border bg-background px-3 py-2 text-sm font-mono uppercase',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                compactCurrency ? 'w-[4.5rem]' : 'w-24',
              )}
            />
            {availableCodes.length > 0 && (
              <datalist id="nbp-currency-codes">
                {availableCodes.map((code) => (
                  <option key={code} value={code} />
                ))}
              </datalist>
            )}
          </div>

          {compactDate ? (
            <div className="flex flex-col items-center gap-0.5">
              {!compactLabels && (
                <span className="text-xs font-medium text-muted-foreground">
                  {t('filters.startDate')}
                </span>
              )}
              <button
                type="button"
                aria-label={t('filters.startDate')}
                onClick={() => startInputRef.current?.showPicker()}
                className={cn(
                  'rounded-md border border-border p-2 text-muted-foreground transition-colors',
                  'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  startDate && 'border-primary text-primary',
                )}
              >
                <Calendar size={16} aria-hidden="true" />
              </button>
              <input
                ref={startInputRef}
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                aria-label={t('filters.startDate')}
                className="sr-only"
              />
              {startDate && (
                <span className="text-[10px] text-muted-foreground">{startDate.slice(5)}</span>
              )}
            </div>
          ) : (
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
          )}

          {compactDate ? (
            <div className="flex flex-col items-center gap-0.5">
              {!compactLabels && (
                <span className="text-xs font-medium text-muted-foreground">
                  {t('filters.endDate')}
                </span>
              )}
              <button
                type="button"
                aria-label={t('filters.endDate')}
                onClick={() => endInputRef.current?.showPicker()}
                className={cn(
                  'rounded-md border border-border p-2 text-muted-foreground transition-colors',
                  'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  endDate && 'border-primary text-primary',
                )}
              >
                <Calendar size={16} aria-hidden="true" />
              </button>
              <input
                ref={endInputRef}
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                aria-label={t('filters.endDate')}
                className="sr-only"
              />
              {endDate && (
                <span className="text-[10px] text-muted-foreground">{endDate.slice(5)}</span>
              )}
            </div>
          ) : (
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
          )}

          {compactReset ? (
            <button
              type="button"
              aria-label={t('filters.clear')}
              onClick={onClear}
              className={cn(
                'rounded-md border border-destructive/50 p-2 text-destructive transition-colors',
                'hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClear}
              className={cn(
                'ml-auto flex items-center gap-2 rounded-md border border-destructive/50 px-3 py-2',
                'text-sm text-destructive transition-colors hover:bg-destructive/10',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <X size={14} aria-hidden="true" />
              {t('filters.clear')}
            </button>
          )}
        </div>
      )}

      {chartDateError && (
        <p role="alert" className="text-xs text-destructive">
          {chartDateError}
        </p>
      )}

      {tab === 'gold' && (
        <div className="flex flex-wrap items-end gap-3">
          {compactDate ? (
            <div className="flex flex-col items-center gap-0.5">
              {!compactLabels && (
                <span className="text-xs font-medium text-muted-foreground">
                  {t('filters.startDate')}
                </span>
              )}
              <button
                type="button"
                aria-label={t('filters.startDate')}
                onClick={() => startInputRef.current?.showPicker()}
                className={cn(
                  'rounded-md border border-border p-2 text-muted-foreground transition-colors',
                  'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  startDate && 'border-primary text-primary',
                )}
              >
                <Calendar size={16} aria-hidden="true" />
              </button>
              <input
                ref={startInputRef}
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                aria-label={t('filters.startDate')}
                className="sr-only"
              />
              {startDate && (
                <span className="text-[10px] text-muted-foreground">{startDate.slice(5)}</span>
              )}
            </div>
          ) : (
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
          )}

          {compactDate ? (
            <div className="flex flex-col items-center gap-0.5">
              {!compactLabels && (
                <span className="text-xs font-medium text-muted-foreground">
                  {t('filters.endDate')}
                </span>
              )}
              <button
                type="button"
                aria-label={t('filters.endDate')}
                onClick={() => endInputRef.current?.showPicker()}
                className={cn(
                  'rounded-md border border-border p-2 text-muted-foreground transition-colors',
                  'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  endDate && 'border-primary text-primary',
                )}
              >
                <Calendar size={16} aria-hidden="true" />
              </button>
              <input
                ref={endInputRef}
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                aria-label={t('filters.endDate')}
                className="sr-only"
              />
              {endDate && (
                <span className="text-[10px] text-muted-foreground">{endDate.slice(5)}</span>
              )}
            </div>
          ) : (
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
          )}
          {compactReset ? (
            <button
              type="button"
              aria-label={t('filters.clear')}
              onClick={onClear}
              className={cn(
                'rounded-md border border-border p-2 text-muted-foreground transition-colors',
                'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClear}
              className={cn(
                'ml-auto flex items-center gap-2 rounded-md border border-border px-3 py-2',
                'text-sm text-muted-foreground transition-colors hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <X size={14} aria-hidden="true" />
              {t('filters.clear')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
