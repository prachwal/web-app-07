import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'motion/react';
import { useIsDark } from '@/lib/useTheme';
import { useIsMobile } from '@/lib/useBreakpoint';
import { formatAxisNumber } from '@/lib/format';
import {
  CHART_AXIS_LIGHT,
  CHART_AXIS_DARK,
  CHART_GRID_LIGHT,
  CHART_GRID_DARK,
  CHART_TOOLTIP_BG_LIGHT,
  CHART_TOOLTIP_BG_DARK,
  CHART_TOOLTIP_TEXT_LIGHT,
  CHART_TOOLTIP_TEXT_DARK,
  CHART_COLOR_MID,
  CHART_COLOR_BID,
  CHART_COLOR_ASK,
  CHART_COLOR_GOLD_LINE,
} from '@/lib/chartColors';
import * as logger from '@/lib/logger';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import { SkeletonChart } from '@/components/ui/Skeleton';
import type { NbpTab } from '@/store/api/nbpApi';
import type { AxisPresentation, ChartInteractionMode } from '@/store/slices/tableSettingsSlice';

export interface ChartPoint {
  date: string;
  mid?: number;
  cena?: number;
  bid?: number;
  ask?: number;
}

export interface NbpChartProps {
  data: ChartPoint[];
  isLoading: boolean;
  tab: NbpTab;
  currency?: string;
  rangeStart?: string;
  rangeEnd?: string;
  titleAlign?: 'left' | 'center' | 'right';
  axisPresentation?: AxisPresentation;
  interactionMode?: ChartInteractionMode;
  showLegend?: boolean;
  showGrid?: boolean;
  gaplessTimeline?: boolean;
}

type ChartDatum = ChartPoint & { _index: number; hasData: boolean };
type SeriesKey = 'mid' | 'bid' | 'ask' | 'cena';

interface SeriesMetric {
  key: SeriesKey;
  label: string;
  color: string;
  value: number;
  delta?: number | null;
  deltaPct?: number | null;
}

interface SeriesLabels {
  mid: string;
  bid: string;
  ask: string;
  price: string;
}

interface PointSnapshot {
  index: number;
  label: string;
  series: SeriesMetric[];
  min: number;
  max: number;
  rangeLabel: string;
  deltaSummary: string | null;
  valueSummary: string;
}

interface TooltipBridgeProps {
  active?: boolean;
  payload?: ReadonlyArray<unknown>;
  label?: string | number;
  onSelectIndex: (index: number | null) => void;
  interactionMode: ChartInteractionMode;
  data: ChartDatum[];
  tab: NbpTab;
  labels: SeriesLabels;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function formatDelta(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatAxisNumber(value)}`;
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function parseDateKey(value: string): Date | null {
  const parts = value.split('-').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function buildDateRange(start: string, end: string): string[] {
  const parsedStart = parseDateKey(start);
  const parsedEnd = parseDateKey(end);
  if (!parsedStart || !parsedEnd || parsedStart > parsedEnd) return [];

  const dates: string[] = [];
  const current = new Date(parsedStart);
  while (current <= parsedEnd) {
    dates.push(formatDateKey(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

function sampleDates(dates: string[], maxTicks: number): string[] {
  if (dates.length <= maxTicks) return dates;
  const result = new Set<string>();
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (first) result.add(first);
  if (last) result.add(last);
  const step = (dates.length - 1) / Math.max(maxTicks - 1, 1);
  for (let i = 1; i < maxTicks - 1; i += 1) {
    const index = Math.round(i * step);
    const tick = dates[index];
    if (tick) result.add(tick);
  }
  return Array.from(result).sort();
}

function getValueBuckets(data: ChartDatum[], tab: NbpTab): number[] {
  return data.flatMap((point) => {
    if (!point.hasData) return [];
    if (tab === 'C') {
      return [point.bid, point.ask].filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    }
    return [tab === 'gold' ? point.cena : point.mid].filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  });
}

function getAdaptiveYDomain(values: number[], tab: NbpTab): [number, number] {
  if (values.length === 0) return [0, 1];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min;
  const baseline = Math.max(Math.abs(min), Math.abs(max), 1);
  const minSpan = tab === 'gold' ? Math.max(baseline * 0.01, 1) : Math.max(baseline * 0.01, 0.01);
  const padding = Math.max(spread * 0.12, minSpan);
  const center = (min + max) / 2;
  const halfSpan = Math.max(spread / 2 + padding, minSpan / 2);
  return [center - halfSpan, center + halfSpan];
}

function normalizeTimeline(
  data: ChartPoint[],
  rangeStart?: string,
  rangeEnd?: string,
): ChartDatum[] {
  if (data.length === 0) return [];

  const indexed = new Map<string, ChartPoint>();
  for (const point of data) {
    indexed.set(point.date, point);
  }

  const start = rangeStart ?? data[0]?.date;
  const end = rangeEnd ?? data[data.length - 1]?.date;
  const range = start && end ? buildDateRange(start, end) : [];
  if (range.length === 0) {
    return data.map((point, index) => ({ ...point, _index: index, hasData: true }));
  }

  return range.map((date, index) => {
    const point = indexed.get(date);
    if (!point) {
      return { date, _index: index, hasData: false };
    }
    return { ...point, _index: index, hasData: true };
  });
}

function findPreviousRealIndex(points: ChartDatum[], index: number): number | null {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (points[i]?.hasData) return i;
  }
  return null;
}

function findLastRealIndex(points: ChartDatum[]): number | null {
  for (let i = points.length - 1; i >= 0; i -= 1) {
    if (points[i]?.hasData) return i;
  }
  return null;
}

function getSeriesDefinitions(
  tab: NbpTab,
  point: ChartDatum,
  previous?: ChartDatum,
  labels?: SeriesLabels,
): SeriesMetric[] {
  if (tab === 'C') {
    return [
      {
        key: 'bid',
        label: labels?.bid ?? 'Bid',
        color: CHART_COLOR_BID,
        value: point.bid ?? 0,
        delta: point.bid != null && previous?.bid != null ? point.bid - previous.bid : null,
        deltaPct: point.bid != null && previous?.bid != null && previous.bid !== 0 ? ((point.bid - previous.bid) / previous.bid) * 100 : null,
      },
      {
        key: 'ask',
        label: labels?.ask ?? 'Ask',
        color: CHART_COLOR_ASK,
        value: point.ask ?? 0,
        delta: point.ask != null && previous?.ask != null ? point.ask - previous.ask : null,
        deltaPct: point.ask != null && previous?.ask != null && previous.ask !== 0 ? ((point.ask - previous.ask) / previous.ask) * 100 : null,
      },
    ];
  }

  const key: SeriesKey = tab === 'gold' ? 'cena' : 'mid';
  const label = tab === 'gold' ? (labels?.price ?? 'Price') : (labels?.mid ?? 'Mid');
  const color = tab === 'gold' ? CHART_COLOR_GOLD_LINE : CHART_COLOR_MID;
  const value = tab === 'gold' ? (point.cena ?? 0) : (point.mid ?? 0);
  const prev = tab === 'gold' ? previous?.cena : previous?.mid;
  return [
    {
      key,
      label,
      color,
      value,
      delta: value != null && prev != null ? value - prev : null,
      deltaPct: value != null && prev != null && prev !== 0 ? ((value - prev) / prev) * 100 : null,
    },
  ];
}

function getValueSummary(tab: NbpTab, series: SeriesMetric[]): string {
  if (tab === 'C') {
    const bid = series.find((item) => item.key === 'bid')?.value;
    const ask = series.find((item) => item.key === 'ask')?.value;
    return `${formatAxisNumber(bid ?? 0)} / ${formatAxisNumber(ask ?? 0)}`;
  }

  return formatAxisNumber(series[0]?.value ?? 0);
}

function buildSnapshot(
  data: ChartDatum[],
  tab: NbpTab,
  index: number,
  labels: SeriesLabels,
): PointSnapshot {
  let fallbackPoint = data[data.length - 1];
  for (let i = data.length - 1; i >= 0; i -= 1) {
    if (data[i]?.hasData) {
      fallbackPoint = data[i];
      break;
    }
  }
  const point = data[index] ?? fallbackPoint;
  const previousIndex = findPreviousRealIndex(data, index);
  const previous = previousIndex != null ? data[previousIndex] : undefined;
  const series = getSeriesDefinitions(tab, point, previous, labels);
  const values = series.map((item) => item.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const deltaSummary =
    series.length === 1
      ? `${formatDelta(series[0]?.delta)} (${formatPercent(series[0]?.deltaPct)})`
      : series
          .map((item) => `${item.label}: ${formatDelta(item.delta)} (${formatPercent(item.deltaPct)})`)
          .join(' · ');

  return {
    index,
    label: point?.date ?? '',
    series,
    min,
    max,
    rangeLabel: `${formatAxisNumber(min)} - ${formatAxisNumber(max)}`,
    deltaSummary,
    valueSummary: getValueSummary(tab, series),
  };
}

function resolveSelectedIndex(
  payload: TooltipBridgeProps['payload'],
): number | null {
  const firstPayload = payload?.[0] as { payload?: ChartDatum } | undefined;
  const point = firstPayload?.payload;
  return point?._index ?? null;
}

function TooltipBridge({
  active,
  payload,
  onSelectIndex,
  interactionMode,
  data,
  tab,
  labels,
  t,
}: TooltipBridgeProps): React.JSX.Element | null {
  const index = resolveSelectedIndex(payload);

  useEffect(() => {
    if (interactionMode === 'off') {
      onSelectIndex(null);
      return;
    }

    if (!active || index == null) {
      if (interactionMode === 'hover') onSelectIndex(null);
      return;
    }

    onSelectIndex(index);
  }, [active, index, interactionMode, onSelectIndex]);

  if (!active || !payload?.length || index == null) return null;

  const firstPayload = payload[0] as { payload?: ChartDatum } | undefined;
  const point = firstPayload?.payload;
  if (!point) return null;

  const header = point.date.slice(5);
  const previousIndex = findPreviousRealIndex(data, index);
  const previous = previousIndex != null ? data[previousIndex] : undefined;
  const series = getSeriesDefinitions(tab, point, previous, labels);

  return (
    <div className="max-w-[18rem] rounded-xl border border-border bg-background/95 p-3 text-xs shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
        <span className="font-medium text-foreground">{header}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {interactionMode === 'pinned' ? t('chart.pinned') : t('chart.hover')}
        </span>
      </div>

      <div className="mt-2 space-y-2">
        {series.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <div className="text-right">
              <div className="font-medium text-foreground tabular-nums">{formatAxisNumber(item.value)}</div>
              <div className="text-[10px] text-muted-foreground">
                {t('chart.deltaShort', { delta: formatDelta(item.delta), pct: formatPercent(item.deltaPct) })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 border-t border-border/70 pt-2 text-[10px] text-muted-foreground">
        {interactionMode === 'pinned' ? t('chart.tapHint') : t('chart.hoverHint')}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  accent,
  className,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('rounded-xl border border-border bg-background px-3 py-2', className)}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{value}</div>
          {detail && <div className="mt-0.5 text-[10px] text-muted-foreground">{detail}</div>}
        </div>
        {accent && <div className="shrink-0 text-[10px] text-muted-foreground">{accent}</div>}
      </div>
    </div>
  );
}

export function NbpChart({
  data,
  isLoading,
  tab,
  currency = '',
  rangeStart,
  rangeEnd,
  titleAlign,
  axisPresentation = 'labels',
  interactionMode = 'hover',
  showLegend = true,
  showGrid = true,
  gaplessTimeline = true,
}: NbpChartProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const reducedMotion = useReducedMotion();
  const animate = !reducedMotion;
  const isDark = useIsDark();
  const isMobile = useIsMobile();

  const axisColor = isDark ? CHART_AXIS_DARK : CHART_AXIS_LIGHT;
  const gridColor = isDark ? CHART_GRID_DARK : CHART_GRID_LIGHT;
  const tooltipBg = isDark ? CHART_TOOLTIP_BG_DARK : CHART_TOOLTIP_BG_LIGHT;
  const tooltipFg = isDark ? CHART_TOOLTIP_TEXT_DARK : CHART_TOOLTIP_TEXT_LIGHT;
  const seriesColor = tab === 'gold' ? CHART_COLOR_GOLD_LINE : tab === 'C' ? CHART_COLOR_BID : CHART_COLOR_MID;
  const seriesLabels = useMemo<SeriesLabels>(
    () => ({
      mid: t('chart.mid'),
      bid: t('chart.bid'),
      ask: t('chart.ask'),
      price: t('chart.axisGold'),
    }),
    [t],
  );

  const showAxisLabels = axisPresentation === 'labels';
  const showCombined = axisPresentation === 'combined';
  const effectiveInteractionMode: ChartInteractionMode =
    isMobile && interactionMode === 'hover' ? 'pinned' : interactionMode;
  const chartPoints = useMemo<ChartDatum[]>(
    () => normalizeTimeline(data, rangeStart, rangeEnd),
    [data, rangeEnd, rangeStart],
  );
  const realPoints = useMemo(() => chartPoints.filter((point) => point.hasData), [chartPoints]);
  const realDates = useMemo(() => realPoints.map((point) => point.date), [realPoints]);
  const xTicks = useMemo(() => sampleDates(realDates, isMobile ? 4 : 6), [isMobile, realDates]);
  const yValues = useMemo(() => getValueBuckets(chartPoints, tab), [chartPoints, tab]);
  const yDomain = useMemo(() => getAdaptiveYDomain(yValues, tab), [tab, yValues]);
  const yTickCount = useMemo(() => {
    if (yValues.length <= 2) return 3;
    if (yValues.length <= 8) return 4;
    return isMobile ? 4 : 5;
  }, [isMobile, yValues.length]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const activeIndex = selectedIndex ?? findLastRealIndex(chartPoints);
  const activeSnapshot = activeIndex != null ? buildSnapshot(chartPoints, tab, activeIndex, seriesLabels) : null;
  const rangeSnapshot = useMemo(() => {
    if (realPoints.length === 0) return null;
    const seriesValues = yValues;

    if (seriesValues.length === 0) return null;

    const min = Math.min(...seriesValues);
    const max = Math.max(...seriesValues);
    const firstDate = (rangeStart ?? realPoints[0]?.date ?? '').slice(5);
    const lastDate = (rangeEnd ?? realPoints[realPoints.length - 1]?.date ?? '').slice(5);
    return {
      min,
      max,
      firstDate,
      lastDate,
    };
  }, [rangeEnd, rangeStart, realPoints, yValues]);

  const legendItems = useMemo(() => {
    if (tab === 'C') {
      return [
        { label: t('chart.bid'), color: CHART_COLOR_BID },
        { label: t('chart.ask'), color: CHART_COLOR_ASK },
      ];
    }
    return [
      { label: tab === 'gold' ? t('chart.axisGold') : t('chart.mid'), color: seriesColor },
    ];
  }, [seriesColor, tab, t]);

  const titleAlignClass = ({ left: 'text-left', center: 'text-center', right: 'text-right' } as const)[titleAlign ?? 'left'];
  const ariaLabel =
    tab === 'gold'
      ? `${t('chart.heading')} — ${t('chart.axisGold')}`
      : `${t('chart.heading')} — ${currency}`;

  if (isLoading) {
    return <SkeletonChart />;
  }

  if (realPoints.length === 0) {
    logger.debug('NbpChart: no data', { tab, currency });
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground sm:h-80">
        {t('chart.noData')}
      </div>
    );
  }

  const dateTickFormatter = (value: string) => value.slice(5);
  const tooltipTrigger = effectiveInteractionMode === 'pinned' ? 'click' : 'hover';
  const fallbackWindow = [
    (rangeStart ?? realPoints[0]?.date ?? '').slice(5),
    (rangeEnd ?? realPoints[realPoints.length - 1]?.date ?? '').slice(5),
  ]
    .filter(Boolean)
    .join(' → ');
  const tooltipContentStyle = {
    background: tooltipBg,
    border: `1px solid ${gridColor}`,
    borderRadius: '12px',
    fontSize: 12,
    color: tooltipFg,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.18)',
  } as const;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'w-full rounded-2xl border border-border bg-card p-3 sm:p-4',
        'transition-opacity duration-150',
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={cn('text-sm font-medium text-foreground', titleAlignClass)}>{t('chart.heading')}</p>
          <p className={cn('mt-0.5 text-xs text-muted-foreground', titleAlignClass)}>
            {effectiveInteractionMode === 'pinned' ? t('chart.tapHint') : t('chart.hoverHint')}
          </p>
        </div>
        {rangeSnapshot && (
          <div className="text-right text-[11px] text-muted-foreground">
            <div>{t('chart.rangeDate', { from: rangeSnapshot.firstDate, to: rangeSnapshot.lastDate })}</div>
            <div>
              {t('chart.rangeValue', {
                min: formatAxisNumber(rangeSnapshot.min),
                max: formatAxisNumber(rangeSnapshot.max),
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-stretch gap-1">
        {showAxisLabels && (
          <div className="flex shrink-0 items-center justify-center" style={{ width: 14 }}>
            <span
              className="whitespace-nowrap text-[10px] text-muted-foreground"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {tab === 'gold' ? t('chart.axisGold') : t('chart.axisRate')}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className={cn('w-full', isMobile ? 'h-80' : 'h-72 sm:h-80')} style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints} margin={{ top: 8, right: 12, bottom: 4, left: 2 }}>
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    syncWithTicks
                    vertical
                    horizontal
                  />
                )}
                <XAxis
                  dataKey="date"
                  ticks={xTicks}
                  tickFormatter={dateTickFormatter}
                  tick={showAxisLabels ? { fontSize: 10, fill: axisColor } : false}
                  axisLine={showGrid ? { stroke: gridColor } : false}
                  tickLine={false}
                />
                <YAxis
                  domain={yDomain}
                  tickCount={yTickCount}
                  tickFormatter={formatAxisNumber}
                  tick={showAxisLabels ? { fontSize: 10, fill: axisColor } : false}
                  axisLine={showGrid ? { stroke: gridColor } : false}
                  tickLine={false}
                  width={showAxisLabels ? 44 : 0}
                />
                {effectiveInteractionMode !== 'off' && (
                  <Tooltip
                    trigger={tooltipTrigger}
                    cursor={effectiveInteractionMode === 'pinned' ? { stroke: gridColor, strokeWidth: 1 } : true}
                    allowEscapeViewBox={{ x: true, y: true }}
                    content={(props) => (
                      <TooltipBridge
                        {...props}
                        interactionMode={effectiveInteractionMode}
                        data={chartPoints}
                        tab={tab}
                        labels={seriesLabels}
                        onSelectIndex={setSelectedIndex}
                        t={t}
                      />
                    )}
                    contentStyle={tooltipContentStyle}
                    wrapperStyle={{ zIndex: 30 }}
                  />
                )}

                {(tab === 'A' || tab === 'B') && (
                  <Line
                    type="monotone"
                    dataKey="mid"
                    name={t('chart.mid')}
                    stroke={CHART_COLOR_MID}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls={gaplessTimeline}
                    isAnimationActive={animate}
                  />
                )}

                {tab === 'C' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="bid"
                      name={t('chart.bid')}
                      stroke={CHART_COLOR_BID}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      connectNulls={gaplessTimeline}
                      isAnimationActive={animate}
                    />
                    <Line
                      type="monotone"
                      dataKey="ask"
                      name={t('chart.ask')}
                      stroke={CHART_COLOR_ASK}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      connectNulls={gaplessTimeline}
                      isAnimationActive={animate}
                    />
                  </>
                )}

                {tab === 'gold' && (
                  <Line
                    type="monotone"
                    dataKey="cena"
                    name={t('chart.axisGold')}
                    stroke={CHART_COLOR_GOLD_LINE}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls={gaplessTimeline}
                    isAnimationActive={animate}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {showLegend && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1" aria-hidden="true">
              {legendItems.map((item) => (
                <span key={item.label} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="inline-block h-2 w-4 rounded-sm" style={{ background: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          )}

          {showAxisLabels && (
            <p className={cn('mt-0.5 text-center text-[10px] text-muted-foreground', showAxisLabels ? 'ml-[44px]' : 'ml-0')}>
              {t('chart.axisDate')}
            </p>
          )}

          {activeSnapshot && !showCombined && (
            <div className={cn('mt-3 grid gap-2', isMobile ? 'grid-cols-2' : 'grid-cols-2 xl:grid-cols-4')}>
              <SummaryCard
                label={t('chart.summaryPoint')}
                value={activeSnapshot.label.slice(5)}
                detail={activeSnapshot.valueSummary}
              />
              <SummaryCard
                label={t('chart.summaryDelta')}
                value={activeSnapshot.deltaSummary ?? '—'}
                detail={t('chart.summarySelected')}
              />
              <SummaryCard
                label={t('chart.summaryRange')}
                value={activeSnapshot.rangeLabel}
                detail={t('chart.summaryCurrent')}
              />
              <SummaryCard
                label={t('chart.summaryWindow')}
                value={rangeSnapshot ? `${rangeSnapshot.firstDate} → ${rangeSnapshot.lastDate}` : '—'}
                detail={tab === 'gold' ? t('chart.axisGold') : t('chart.axisRate')}
              />
            </div>
          )}

          {showCombined && activeSnapshot && (
            <div className="mt-3 rounded-2xl border border-border/70 bg-muted/25 px-3 py-2 text-[11px] text-muted-foreground">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label={t('chart.summaryPoint')}
                  value={activeSnapshot.label.slice(5)}
                  detail={activeSnapshot.valueSummary}
                  className="bg-background/50"
                />
                <SummaryCard
                  label={t('chart.summaryDelta')}
                  value={activeSnapshot.deltaSummary ?? '—'}
                  detail={t('chart.summarySelected')}
                  className="bg-background/50"
                />
                <SummaryCard
                  label={t('chart.summaryRange')}
                  value={activeSnapshot.rangeLabel}
                  detail={t('chart.summaryCurrent')}
                  className="bg-background/50"
                />
                <SummaryCard
                  label={t('chart.summaryWindow')}
                  value={rangeSnapshot ? `${rangeSnapshot.firstDate} → ${rangeSnapshot.lastDate}` : fallbackWindow || '—'}
                  detail={tab === 'gold' ? t('chart.axisGold') : t('chart.axisRate')}
                  className="bg-background/50"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
