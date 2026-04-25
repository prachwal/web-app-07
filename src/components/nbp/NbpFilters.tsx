import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NbpTab } from '@/store/api/nbpApi';

const TABS: { id: NbpTab; labelKey: string }[] = [
  { id: 'A', labelKey: 'tabs.tableA' },
  { id: 'B', labelKey: 'tabs.tableB' },
  { id: 'gold', labelKey: 'tabs.gold' },
];

/** Props for the {@link NbpFilters} component. */
export interface NbpFiltersProps {
  /** Currently active data tab. */
  tab: NbpTab;
  /** Callback fired when the user switches tabs. */
  onTabChange: (tab: NbpTab) => void;
  /** Current search query (for Table A / B). */
  search: string;
  /** Callback fired when the search input changes. */
  onSearchChange: (value: string) => void;
  /** Start date for gold price range (ISO 8601). */
  startDate: string;
  /** End date for gold price range (ISO 8601). */
  endDate: string;
  /** Callback fired when the start date changes. */
  onStartDateChange: (value: string) => void;
  /** Callback fired when the end date changes. */
  onEndDateChange: (value: string) => void;
  /** Callback fired when the user resets filters. */
  onClear: () => void;
  /** Whether a tab transition is pending (React `useTransition`). */
  isPending?: boolean;
}

/**
 * Filter bar for the NBP page.
 * Renders tab selector plus context-sensitive controls:
 * – search input for exchange tables (A / B)
 * – date-range picker for gold prices
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
}: NbpFiltersProps): React.JSX.Element {
  const { t } = useTranslation('nbp');

  return (
    <div className="flex flex-col gap-4">
      {/* Tab selector */}
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
              'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              tab === id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Search input — only for exchange tables */}
      {tab !== 'gold' && (
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

      {/* Date range — only for gold */}
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
