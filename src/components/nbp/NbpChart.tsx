import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { NbpTab } from '@/store/api/nbpApi';

/** A single data point in the chart. */
export interface ChartPoint {
  /** Date string in YYYY-MM-DD format. */
  date: string;
  /** Mid rate (Tables A/B and gold). */
  mid?: number;
  /** Gold price (PLN/g). */
  cena?: number;
  /** Buy rate (Table C). */
  bid?: number;
  /** Sell rate (Table C). */
  ask?: number;
}

/** Props for the {@link NbpChart} component. */
export interface NbpChartProps {
  /** Array of data points to render. */
  data: ChartPoint[];
  /** Whether the data query is in a loading state. */
  isLoading: boolean;
  /** Active tab — determines which series lines to render. */
  tab: NbpTab;
  /** Currency code shown in ARIA label (e.g. "USD"). Empty for gold. */
  currency?: string;
}

/**
 * Renders a line chart for NBP exchange rate or gold price historical series.
 *
 * – Tables A/B: single mid-rate line.
 * – Table C: two lines — bid (buy) and ask (sell).
 * – Gold: single price-per-gram line.
 * – Animations are disabled when the user prefers reduced motion.
 *
 * @param props - {@link NbpChartProps}
 * @returns The chart element or a loading/empty state
 */
export function NbpChart({ data, isLoading, tab, currency = '' }: NbpChartProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const reducedMotion = useReducedMotion();
  const animate = !reducedMotion;

  const yLabel = tab === 'gold' ? t('chart.axisGold') : t('chart.axisRate');
  const ariaLabel =
    tab === 'gold'
      ? `${t('chart.heading')} — ${t('chart.axisGold')}`
      : `${t('chart.heading')} — ${currency}`;

  /* ── auto-scale Y domain for better visualization ── */
  const yDomain = useMemo<[number, number] | undefined>(() => {
    let values: number[] = [];
    if (tab === 'A' || tab === 'B') {
      values = data.map((d) => d.mid).filter((v): v is number => v != null && isFinite(v));
    } else if (tab === 'C') {
      values = [
        ...data.map((d) => d.bid).filter((v): v is number => v != null && isFinite(v)),
        ...data.map((d) => d.ask).filter((v): v is number => v != null && isFinite(v)),
      ];
    } else {
      // gold
      values = data.map((d) => d.cena).filter((v): v is number => v != null && isFinite(v));
    }

    if (values.length === 0) return undefined;

    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const span = rawMax - rawMin;

    // For a flat line (span === 0) use ±0.5% of the value, with 0 protected against zero-divide
    const padding = span === 0 ? Math.max(Math.abs(rawMin) * 0.005, 0.0001) : span * 0.06;
    return [rawMin - padding, rawMax + padding];
  }, [data, tab]);

  /* ── loading skeleton ── */
  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label={t('grid.loading')}
        className="h-64 animate-pulse rounded-md bg-muted"
      />
    );
  }

  /* ── no data ── */
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
        {t('chart.noData')}
      </div>
    );
  }

  /* ── axis formatter — shorten date to MM-DD ── */
  const tickFormatter = (value: string) => value.slice(5);

  /* ── chart color palette (explicit hex — CSS vars unsupported in SVG fill attributes) ── */
  const COLOR_MID = '#3b82f6';   // blue-500
  const COLOR_BID = '#22c55e';   // green-500
  const COLOR_ASK = '#ef4444';   // red-500
  const COLOR_GOLD = '#f59e0b';  // amber-500

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'w-full rounded-md border border-border bg-card p-4',
        'transition-opacity duration-150',
      )}
    >
      <p className="mb-4 text-sm font-medium text-foreground">{t('chart.heading')}</p>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
            label={{
              value: t('chart.axisDate'),
              position: 'insideBottom',
              offset: -2,
              style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
            width={56}
            label={{
              value: yLabel,
              angle: -90,
              position: 'insideLeft',
              offset: 12,
              style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: 12,
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}
          />

          {/* Table A / B — single mid line */}
          {(tab === 'A' || tab === 'B') && (
            <Line
              type="monotone"
              dataKey="mid"
              name={t('chart.mid')}
              stroke={COLOR_MID}
              strokeWidth={2}
              dot={false}
              isAnimationActive={animate}
            />
          )}

          {/* Table C — bid + ask lines */}
          {tab === 'C' && (
            <>
              <Line
                type="monotone"
                dataKey="bid"
                name={t('chart.bid')}
                stroke={COLOR_BID}
                strokeWidth={2}
                dot={false}
                isAnimationActive={animate}
              />
              <Line
                type="monotone"
                dataKey="ask"
                name={t('chart.ask')}
                stroke={COLOR_ASK}
                strokeWidth={2}
                dot={false}
                isAnimationActive={animate}
              />
            </>
          )}

          {/* Gold — single price line */}
          {tab === 'gold' && (
            <Line
              type="monotone"
              dataKey="cena"
              name={t('chart.axisGold')}
              stroke={COLOR_GOLD}
              strokeWidth={2}
              dot={false}
              isAnimationActive={animate}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
