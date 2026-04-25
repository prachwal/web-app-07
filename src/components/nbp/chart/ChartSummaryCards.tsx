import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { NbpTab } from '@/store/api/nbpApi';
import type { AxisPresentation } from '@/store/slices/tableSettingsSlice';

interface SummaryCardProps {
  label: string;
  value: string;
  detail?: string;
  className?: string;
}

function SummaryCard({ label, value, detail, className }: SummaryCardProps): React.JSX.Element {
  return (
    <div className={cn('rounded-xl border border-border bg-background px-3 py-2', className)}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{value}</div>
          {detail && <div className="mt-0.5 text-[10px] text-muted-foreground">{detail}</div>}
        </div>
      </div>
    </div>
  );
}

export interface RangeSnapshot {
  min: number;
  max: number;
  firstDate: string;
  lastDate: string;
}

export interface ActiveSnapshot {
  label: string;
  valueSummary: string;
  deltaSummary: string | null;
  rangeLabel: string;
}

export interface ChartSummaryCardsProps {
  activeSnapshot: ActiveSnapshot;
  rangeSnapshot: RangeSnapshot | null;
  tab: NbpTab;
  axisPresentation: AxisPresentation;
  isMobile: boolean;
  fallbackWindow?: string;
}

/**
 * Grid of 4 summary cards shown below the NBP chart.
 * Handles both 'labels' (standalone) and 'combined' (wrapped) axis presentation modes.
 */
export function ChartSummaryCards({
  activeSnapshot,
  rangeSnapshot,
  tab,
  axisPresentation,
  isMobile,
  fallbackWindow = '—',
}: ChartSummaryCardsProps): React.JSX.Element | null {
  const { t } = useTranslation('nbp');

  const windowValue = rangeSnapshot
    ? `${rangeSnapshot.firstDate} → ${rangeSnapshot.lastDate}`
    : fallbackWindow;

  const rateLabel = tab === 'gold' ? t('chart.axisGold') : t('chart.axisRate');

  const cards = (cardClassName?: string) => (
    <>
      <SummaryCard
        label={t('chart.summaryPoint')}
        value={activeSnapshot.label.slice(5)}
        detail={activeSnapshot.valueSummary}
        className={cardClassName}
      />
      <SummaryCard
        label={t('chart.summaryDelta')}
        value={activeSnapshot.deltaSummary ?? '—'}
        detail={t('chart.summarySelected')}
        className={cardClassName}
      />
      <SummaryCard
        label={t('chart.summaryRange')}
        value={activeSnapshot.rangeLabel}
        detail={t('chart.summaryCurrent')}
        className={cardClassName}
      />
      <SummaryCard
        label={t('chart.summaryWindow')}
        value={windowValue}
        detail={rateLabel}
        className={cardClassName}
      />
    </>
  );

  if (axisPresentation === 'combined') {
    return (
      <div className="mt-3 rounded-2xl border border-border/70 bg-muted/25 px-3 py-2 text-[11px] text-muted-foreground">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {cards('bg-background/50')}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('mt-3 grid gap-2', isMobile ? 'grid-cols-2' : 'grid-cols-2 xl:grid-cols-4')}>
      {cards()}
    </div>
  );
}
