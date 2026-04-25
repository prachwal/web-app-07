import { useState, useEffect, useTransition, useDeferredValue, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/useBreakpoint';
import { PageLayout } from '@/components/layout/PageLayout';
import { NbpFilters } from '@/components/nbp/NbpFilters';
import { NbpGrid } from '@/components/nbp/NbpGrid';
import { NbpTiles } from '@/components/nbp/NbpTiles';
import { NbpChart, type ChartPoint } from '@/components/nbp/NbpChart';
import { NbpDetails, type NbpSelection } from '@/components/nbp/NbpDetails';
import { TableSettingsModal } from '@/components/nbp/TableSettingsModal';
import { BottomSheet } from '@/components/ui/BottomSheet';
import {
  useGetExchangeTableQuery,
  useGetExchangeTableCQuery,
  useGetGoldPricesQuery,
  useGetRatesSeriesQuery,
  useGetRatesSeriesCQuery,
  isNbpRangeValid,
  type NbpTab,
  type NbpTableType,
  type NbpRate,
  type NbpGoldPrice,
} from '@/store/api/nbpApi';

/** Returns an ISO date string N days before today. */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

/** Returns today's date as an ISO string. */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** Valid NbpTab values used to sanitise the URL `tab` param. */
const VALID_TABS: NbpTab[] = ['A', 'B', 'C', 'gold'];

const VALID_VIEWS = ['grid', 'chart', 'tiles'] as const;
type ViewMode = (typeof VALID_VIEWS)[number];

const LS_VIEW_KEY = 'nbp:view';
const LS_FAVORITES_KEY = 'nbp:favorites';

/** Read a value from localStorage safely. Returns null on SSR or parse errors. */
function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Write a value to localStorage safely. */
function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private mode — ignore
  }
}

/**
 * NBP Exchange Rates page.
 *
 * Displays live data from three NBP API endpoints:
 * – Table A (major currencies)
 * – Table B (minor currencies)
 * – Gold prices (configurable date range)
 *
 * Anti-flicker design:
 * – `useTransition` defers tab-switch renders so the previous tab stays
 *   visible while the new data is in-flight.
 * – `useDeferredValue` defers client-side currency search so the grid
 *   never unmounts between keystrokes.
 * – RTK Query `keepUnusedDataFor: 300` keeps previously fetched tabs
 *   cached for 5 minutes — returning to a tab shows data instantly.
 * – During background refetch (`isFetching`) the grid dims slightly
 *   instead of showing a loader.
 *
 * @returns The NBP page element
 */
export function NbpPage(): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const reducedMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  /* ── URL-derived state (URL is the single source of truth for filters) ── */
  const tabParam = searchParams.get('tab');
  const tab: NbpTab = VALID_TABS.includes(tabParam as NbpTab) ? (tabParam as NbpTab) : 'A';

  const rawView = searchParams.get('view');
  const viewMode: ViewMode = VALID_VIEWS.includes(rawView as ViewMode)
    ? (rawView as ViewMode)
    : 'grid';

  const chartCode = searchParams.get('code') ?? '';
  const startDate = searchParams.get('start') ?? daysAgo(30);
  const endDate = searchParams.get('end') ?? today();

  /* ── local-only state ── */
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [selection, setSelection] = useState<NbpSelection | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* ── favorites (localStorage-persisted) ── */
  const [favorites, setFavorites] = useState<string[]>(() => lsGet<string[]>(LS_FAVORITES_KEY) ?? []);

  const toggleFavorite = useCallback((code: string) => {
    setFavorites((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      lsSet(LS_FAVORITES_KEY, next);
      return next;
    });
  }, []);

  /* ── pagination per view (grid and tiles separate) ── */
  const [gridPage, setGridPage] = useState(1);
  const [tilesPage, setTilesPage] = useState(1);

  /* ── persist view preference to localStorage on change ── */
  useEffect(() => {
    lsSet(LS_VIEW_KEY, viewMode);
  }, [viewMode]);

  /* ── URL updater — merges partial key/value updates into existing params ── */
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(updates)) {
            if (v) next.set(k, v);
            else next.delete(k);
          }
          // Remove date params when they are not meaningful (grid/tiles view + not gold)
          const nextView = next.get('view') ?? 'grid';
          const nextTab = next.get('tab') ?? 'A';
          if (nextView !== 'chart' && nextTab !== 'gold') {
            next.delete('start');
            next.delete('end');
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  /* ── date range validation ── */
  const chartDateError =
    tab !== 'gold' && viewMode === 'chart' && !isNbpRangeValid(startDate, endDate)
      ? t('series.periodError')
      : null;

  /* ── data queries ── */
  const tableQuery = useGetExchangeTableQuery(tab as NbpTableType, {
    skip: tab === 'gold' || tab === 'C',
  });

  // Always fetch Table C when tab is C — needed for code list in both grid and chart modes
  const tableCQuery = useGetExchangeTableCQuery(undefined, {
    skip: tab !== 'C',
  });

  const goldQuery = useGetGoldPricesQuery(
    { startDate, endDate },
    { skip: tab !== 'gold' },
  );

  const seriesABQuery = useGetRatesSeriesQuery(
    { table: tab as NbpTableType, code: chartCode, startDate, endDate },
    {
      skip:
        tab === 'gold' ||
        tab === 'C' ||
        viewMode !== 'chart' ||
        chartCode.length !== 3 ||
        !isNbpRangeValid(startDate, endDate),
    },
  );

  const seriesCQuery = useGetRatesSeriesCQuery(
    { code: chartCode, startDate, endDate },
    {
      skip:
        tab !== 'C' ||
        viewMode !== 'chart' ||
        chartCode.length !== 3 ||
        !isNbpRangeValid(startDate, endDate),
    },
  );

  /* ── derived data for grid ── */
  const tableEntry = tableQuery.data?.[0];
  const tableCEntry = tableCQuery.data?.[0];

  /** Currency codes available in the current table, used for the chart currency selector. */
  const availableCodes = useMemo<string[]>(() => {
    if (tab === 'A' || tab === 'B') return tableEntry?.rates.map((r) => r.code) ?? [];
    if (tab === 'C') return tableCEntry?.rates.map((r) => r.code) ?? [];
    return [];
  }, [tab, tableEntry, tableCEntry]);

  const filteredRates = useMemo<NbpRate[]>(() => {
    const rates = tableEntry?.rates ?? [];
    if (!deferredSearch) return rates;
    const q = deferredSearch.toLowerCase();
    return rates.filter(
      (r) => r.code.toLowerCase().includes(q) || r.currency.toLowerCase().includes(q),
    );
  }, [tableEntry, deferredSearch]);

  const goldPrices = goldQuery.data ?? [];

  /* ── derived data for chart ── */
  const chartData = useMemo<ChartPoint[]>(() => {
    if (tab === 'gold') {
      return goldPrices.map((g) => ({ date: g.data, cena: g.cena }));
    }
    if (tab === 'C') {
      return seriesCQuery.data?.rates.map((r) => ({ date: r.effectiveDate, bid: r.bid, ask: r.ask })) ?? [];
    }
    return seriesABQuery.data?.rates.map((r) => ({ date: r.effectiveDate, mid: r.mid })) ?? [];
  }, [tab, goldPrices, seriesABQuery.data, seriesCQuery.data]);

  /* ── handlers ── */
  const handleTabChange = (newTab: NbpTab) => {
    startTransition(() => {
      updateParams({ tab: newTab, view: 'grid', code: '' });
    });
    setSearch('');
    setSelection(null);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    const updates: Record<string, string> = { view: mode };
    // Auto-select the first available currency when switching to chart mode with no code set
    if (mode === 'chart' && !chartCode && availableCodes.length > 0) {
      updates.code = availableCodes[0];
    }
    // Reset pagination when switching views
    setGridPage(1);
    setTilesPage(1);
    updateParams(updates);
    setSelection(null);
  };

  /**
   * Navigate to chart mode with a specific currency code pre-selected.
   * Called when the user clicks the chart icon on a currency row in the data grid.
   */
  const handleViewChart = (code: string) => {
    updateParams({ view: 'chart', code });
    setSelection(null);
  };

  const handleClear = () => {
    updateParams({ start: daysAgo(30), end: today() });
    setSelection(null);
  };

  const handleRateSelect = (rate: NbpRate) => {
    if (!tableEntry) return;
    setSelection({
      type: 'rate',
      rate,
      tableEntry: { no: tableEntry.no, effectiveDate: tableEntry.effectiveDate },
    });
  };

  const handleGoldSelect = (price: NbpGoldPrice) => {
    setSelection({ type: 'gold', goldPrice: price });
  };

  const handleRetry = () => {
    if (tab === 'gold') {
      void goldQuery.refetch();
    } else if (tab === 'C') {
      void tableCQuery.refetch();
    } else {
      void tableQuery.refetch();
    }
  };

  /* ── active query state ── */
  const activeError =
    tab === 'gold'
      ? goldQuery.error
      : tab === 'C'
        ? tableCQuery.error
        : tableQuery.error;

  const activeIsLoading =
    tab === 'gold'
      ? goldQuery.isLoading
      : tab === 'C'
        ? tableCQuery.isLoading
        : tableQuery.isLoading;

  const activeIsFetching =
    isPending ||
    (tab === 'gold'
      ? goldQuery.isFetching
      : tab === 'C'
        ? tableCQuery.isFetching
        : tableQuery.isFetching);

  const chartIsLoading =
    tab === 'C'
      ? seriesCQuery.isLoading || seriesCQuery.isFetching
      : tab === 'gold'
        ? goldQuery.isLoading || goldQuery.isFetching
        : seriesABQuery.isLoading || seriesABQuery.isFetching;

  const selectedCode =
    selection?.type === 'rate' ? selection.rate.code : null;
  const selectedGoldDate =
    selection?.type === 'gold' ? selection.goldPrice.data : null;

  const showChart = viewMode === 'chart';
  const showTiles = viewMode === 'tiles';

  /** Table entry for the active tab — used for the description bar. */
  const activeEntry = tab === 'C' ? tableCEntry : tab === 'gold' ? null : tableEntry;

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-10 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Page header */}
          <header className="mb-4 sm:mb-8">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">{t('title')}</h1>
            <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{t('subtitle')}</p>
          </header>

          {/* Filters */}
          <div className="mb-4">
            <NbpFilters
              tab={tab}
              onTabChange={handleTabChange}
              search={search}
              onSearchChange={setSearch}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(v) => updateParams({ start: v })}
              onEndDateChange={(v) => updateParams({ end: v })}
              onClear={handleClear}
              isPending={isPending}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              chartCode={chartCode}
              onChartCodeChange={(v) => updateParams({ code: v })}
              chartDateError={chartDateError}
              availableCodes={availableCodes}
            />
          </div>

          {/* Table description bar — short auto-generated summary from API data */}
          <div className="mb-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs sm:mb-5 sm:px-4 sm:text-sm">
            <span className="font-medium text-foreground">{t(`tableDesc.${tab}`)}</span>
            {activeEntry && (
              <>
                <br className="sm:hidden" />
                <span className="text-muted-foreground sm:ml-2">
                  <span className="hidden sm:inline">{'· '}</span>
                  {t('tableDesc.info', {
                    count: activeEntry.rates.length,
                    date: activeEntry.effectiveDate,
                  })}
                </span>
              </>
            )}
            {tab === 'gold' && (
              <>
                <br className="sm:hidden" />
                <span className="text-muted-foreground sm:ml-2">
                  <span className="hidden sm:inline">{'· '}</span>
                  {t('tableDesc.goldInfo', { start: startDate, end: endDate })}
                </span>
              </>
            )}
          </div>

          {/* Main content */}
          {showChart ? (
            /* Chart view */
            <NbpChart
              data={chartData}
              isLoading={chartIsLoading}
              tab={tab}
              currency={chartCode || (tab === 'gold' ? '' : '')}
            />
          ) : showTiles ? (
            /* Tiles (kafelki) view */
            <NbpTiles
              tab={tab}
              rates={tab === 'C' ? [] : filteredRates}
              ratesC={tab === 'C' ? (tableCEntry?.rates ?? []) : []}
              goldPrices={goldPrices}
              isLoading={activeIsLoading}
              isFetching={activeIsFetching}
              error={activeError}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onViewChart={tab !== 'gold' ? handleViewChart : undefined}
              onRetry={handleRetry}
              page={tilesPage}
              onPageChange={setTilesPage}
            />
          ) : (
            /* Grid + details side-panel (desktop) / bottom sheet (mobile) */
            <>
              <div
                className={cn(
                  'grid gap-6',
                  !isMobile && selection && 'lg:grid-cols-[1fr_280px]',
                )}
              >
                <NbpGrid
                  tab={tab}
                  rates={tab === 'C' ? [] : filteredRates}
                  ratesC={tab === 'C' ? (tableCEntry?.rates ?? []) : []}
                  goldPrices={goldPrices}
                  isLoading={activeIsLoading}
                  isFetching={activeIsFetching}
                  error={activeError}
                  selectedCode={selectedCode}
                  selectedGoldDate={selectedGoldDate}
                  onRateSelect={handleRateSelect}
                  onGoldSelect={handleGoldSelect}
                  onRetry={handleRetry}
                  onViewChart={tab !== 'gold' ? handleViewChart : undefined}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  page={gridPage}
                  onPageChange={setGridPage}
                  onOpenSettings={() => setSettingsOpen(true)}
                />

                {/* Desktop inline details panel — hidden on mobile (uses BottomSheet instead) */}
                {!isMobile && (
                  <NbpDetails
                    selection={selection}
                    onClose={() => setSelection(null)}
                    onNavigateToChart={tab !== 'gold' ? handleViewChart : undefined}
                  />
                )}
              </div>

              {/* Mobile bottom sheet — slides up over the table when a row is selected */}
              <BottomSheet
                open={isMobile && selection !== null}
                onClose={() => setSelection(null)}
                ariaLabel={t('details.heading')}
              >
                <NbpDetails
                  selection={selection}
                  onClose={() => setSelection(null)}
                  onNavigateToChart={tab !== 'gold' ? handleViewChart : undefined}
                />
              </BottomSheet>

              {/* Column settings modal */}
              <TableSettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                group={tab === 'gold' ? 'gold' : tab === 'C' ? 'C' : tab}
              />
            </>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
}
