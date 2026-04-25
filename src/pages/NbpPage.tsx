import { useState, useTransition, useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { PageLayout } from '@/components/layout/PageLayout';
import { NbpFilters } from '@/components/nbp/NbpFilters';
import { NbpGrid } from '@/components/nbp/NbpGrid';
import { NbpDetails, type NbpSelection } from '@/components/nbp/NbpDetails';
import {
  useGetExchangeTableQuery,
  useGetGoldPricesQuery,
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

  /* ── tab state ── */
  const [tab, setTab] = useState<NbpTab>('A');
  const [isPending, startTransition] = useTransition();

  /* ── search state (exchange tables) ── */
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  /* ── gold date-range state ── */
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(today());

  /* ── selection state (details panel) ── */
  const [selection, setSelection] = useState<NbpSelection | null>(null);

  /* ── data queries ── */
  const tableQuery = useGetExchangeTableQuery(tab as NbpTableType, {
    skip: tab === 'gold',
  });

  const goldQuery = useGetGoldPricesQuery(
    { startDate, endDate },
    { skip: tab !== 'gold' },
  );

  /* ── derived data ── */
  const tableEntry = tableQuery.data?.[0];

  const filteredRates = useMemo<NbpRate[]>(() => {
    const rates = tableEntry?.rates ?? [];
    if (!deferredSearch) return rates;
    const q = deferredSearch.toLowerCase();
    return rates.filter(
      (r) => r.code.toLowerCase().includes(q) || r.currency.toLowerCase().includes(q),
    );
  }, [tableEntry, deferredSearch]);

  const goldPrices = goldQuery.data ?? [];

  /* ── handlers ── */
  const handleTabChange = (newTab: NbpTab) => {
    startTransition(() => {
      setTab(newTab);
      setSearch('');
      setSelection(null);
    });
  };

  const handleClear = () => {
    setStartDate(daysAgo(30));
    setEndDate(today());
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
    } else {
      void tableQuery.refetch();
    }
  };

  /* ── active query state (for whichever tab is showing) ── */
  const activeError = tab === 'gold' ? goldQuery.error : tableQuery.error;
  const activeIsLoading = tab === 'gold' ? goldQuery.isLoading : tableQuery.isLoading;
  const activeIsFetching =
    isPending || (tab === 'gold' ? goldQuery.isFetching : tableQuery.isFetching);

  const selectedCode =
    selection?.type === 'rate' ? selection.rate.code : null;
  const selectedGoldDate =
    selection?.type === 'gold' ? selection.goldPrice.data : null;

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
          <div className="mb-6">
            <NbpFilters
              tab={tab}
              onTabChange={handleTabChange}
              search={search}
              onSearchChange={setSearch}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onClear={handleClear}
              isPending={isPending}
            />
          </div>

          {/* Table info bar (exchange tables only) */}
          {tab !== 'gold' && tableEntry && (
            <p className="mb-3 text-xs text-muted-foreground">
              {t('grid.no')}: <span className="font-mono">{tableEntry.no}</span>
              {' · '}
              {tableEntry.effectiveDate}
            </p>
          )}

          {/* Main content: grid + details side-panel */}
          <div
            className={`grid gap-6 ${selection ? 'lg:grid-cols-[1fr_280px]' : 'grid-cols-1'}`}
          >
            <NbpGrid
              tab={tab}
              rates={filteredRates}
              goldPrices={goldPrices}
              isLoading={activeIsLoading}
              isFetching={activeIsFetching}
              error={activeError}
              selectedCode={selectedCode}
              selectedGoldDate={selectedGoldDate}
              onRateSelect={handleRateSelect}
              onGoldSelect={handleGoldSelect}
              onRetry={handleRetry}
            />

            <NbpDetails selection={selection} onClose={() => setSelection(null)} />
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
