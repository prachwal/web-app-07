import { useState, useTransition, useDeferredValue, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { PageLayout } from '@/components/layout/PageLayout';
import { NbpFilters } from '@/components/nbp/NbpFilters';
import { NbpGrid } from '@/components/nbp/NbpGrid';
import { NbpChart, type ChartPoint } from '@/components/nbp/NbpChart';
import { NbpDetails, type NbpSelection } from '@/components/nbp/NbpDetails';
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

  /* ── URL-derived state (URL is the single source of truth for filters) ── */
  const tabParam = searchParams.get('tab');
  const tab: NbpTab = VALID_TABS.includes(tabParam as NbpTab) ? (tabParam as NbpTab) : 'A';
  const viewMode: 'grid' | 'chart' = searchParams.get('view') === 'chart' ? 'chart' : 'grid';
  const chartCode = searchParams.get('code') ?? '';
  const startDate = searchParams.get('start') ?? daysAgo(30);
  const endDate = searchParams.get('end') ?? today();

  /* ── local-only state ── */
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [selection, setSelection] = useState<NbpSelection | null>(null);

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

  const handleViewModeChange = (mode: 'grid' | 'chart') => {
    const updates: Record<string, string> = { view: mode };
    // Auto-select the first available currency when switching to chart mode with no code set
    if (mode === 'chart' && !chartCode && availableCodes.length > 0) {
      updates.code = availableCodes[0];
    }
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

  /** Table entry for the active tab — used for the description bar. */
  const activeEntry = tab === 'C' ? tableCEntry : tab === 'gold' ? null : tableEntry;

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Page header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('subtitle')}</p>
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
          <div className="mb-5 rounded-lg border border-border/60 bg-muted/30 px-4 py-2 text-sm">
            <span className="font-medium text-foreground">{t(`tableDesc.${tab}`)}</span>
            {activeEntry && (
              <span className="ml-2 text-muted-foreground">
                {'· '}
                {t('tableDesc.info', {
                  count: activeEntry.rates.length,
                  date: activeEntry.effectiveDate,
                })}
              </span>
            )}
            {tab === 'gold' && (
              <span className="ml-2 text-muted-foreground">
                {'· '}
                {t('tableDesc.goldInfo', { start: startDate, end: endDate })}
              </span>
            )}
          </div>

          {/* Main content */}
          {!showChart ? (
            /* Grid + details side-panel */
            <div
              className={`grid gap-6 ${selection ? 'lg:grid-cols-[1fr_280px]' : 'grid-cols-1'}`}
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
              />

              <NbpDetails selection={selection} onClose={() => setSelection(null)} />
            </div>
          ) : (
            /* Chart view */
            <NbpChart
              data={chartData}
              isLoading={chartIsLoading}
              tab={tab}
              currency={chartCode || (tab === 'gold' ? '' : '')}
            />
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
}
