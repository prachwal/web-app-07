import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'motion/react';
import { useIsDark } from '@/lib/useTheme';
import { formatAxisNumber } from '@/lib/format';
import {
  CHART_AXIS_LIGHT, CHART_AXIS_DARK,
  CHART_GRID_LIGHT, CHART_GRID_DARK,
  CHART_TOOLTIP_BG_LIGHT, CHART_TOOLTIP_BG_DARK,
  CHART_TOOLTIP_TEXT_LIGHT, CHART_TOOLTIP_TEXT_DARK,
  CHART_COLOR_MID, CHART_COLOR_BID, CHART_COLOR_ASK, CHART_COLOR_GOLD_LINE,
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
import type { NbpTab } from '@/store/api/nbpApi';
import type { AxisPresentation } from '@/store/slices/tableSettingsSlice';

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
  titleAlign?: 'left' | 'center' | 'right';
  axisPresentation?: AxisPresentation;
}

export function NbpChart({ data, isLoading, tab, currency = '', titleAlign, axisPresentation = 'labels' }: NbpChartProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const reducedMotion = useReducedMotion();
  const animate = !reducedMotion;
  const isDark = useIsDark();

  const axisColor  = isDark ? CHART_AXIS_DARK  : CHART_AXIS_LIGHT;
  const gridColor  = isDark ? CHART_GRID_DARK  : CHART_GRID_LIGHT;
  const tooltipBg  = isDark ? CHART_TOOLTIP_BG_DARK  : CHART_TOOLTIP_BG_LIGHT;
  const tooltipFg  = isDark ? CHART_TOOLTIP_TEXT_DARK : CHART_TOOLTIP_TEXT_LIGHT;
  const COLOR_MID  = CHART_COLOR_MID;
  const COLOR_BID  = CHART_COLOR_BID;
  const COLOR_ASK  = CHART_COLOR_ASK;
  const COLOR_GOLD = CHART_COLOR_GOLD_LINE;

  const yLabel = tab === 'gold' ? t('chart.axisGold') : t('chart.axisRate');
  const showAxisLabels = axisPresentation === 'labels';
  const showTooltipOnly = axisPresentation === 'tooltip';
  const showCombined = axisPresentation === 'combined';
  void showTooltipOnly;
  const ariaLabel =
    tab === 'gold'
      ? `${t('chart.heading')} — ${t('chart.axisGold')}`
      : `${t('chart.heading')} — ${currency}`;

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
      values = data.map((d) => d.cena).filter((v): v is number => v != null && isFinite(v));
    }

    if (values.length === 0) return undefined;

    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const span = rawMax - rawMin;

    const padding = span === 0 ? Math.max(Math.abs(rawMin) * 0.005, 0.0001) : span * 0.06;
    return [rawMin - padding, rawMax + padding];
  }, [data, tab]);

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label={t('grid.loading')}
        className="h-64 animate-pulse rounded-md bg-muted"
      />
    );
  }

  if (data.length === 0) {
    logger.debug('NbpChart: no data', { tab, currency });
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
        {t('chart.noData')}
      </div>
    );
  }

  const dateTickFormatter = (value: string) => value.slice(5);

  const titleAlignClass = ({ left: 'text-left', center: 'text-center', right: 'text-right' } as const)[titleAlign ?? 'left'];

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'w-full rounded-md border border-border bg-card p-4',
        'transition-opacity duration-150',
      )}
    >
      <p className={cn('mb-2 text-sm font-medium text-foreground', titleAlignClass)}>{t('chart.heading')}</p>

      <div className="flex items-stretch gap-1">
        {showAxisLabels && (
          <div className="flex shrink-0 items-center justify-center" style={{ width: 14 }}>
            <span
              className="whitespace-nowrap text-[10px] text-muted-foreground"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {yLabel}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="h-56 w-full sm:h-72" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 2 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  tickFormatter={dateTickFormatter}
                  tick={showAxisLabels ? { fontSize: 10, fill: axisColor } : false}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                />
                <YAxis
                  domain={yDomain}
                  tickFormatter={formatAxisNumber}
                  tick={showAxisLabels ? { fontSize: 10, fill: axisColor } : false}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                  width={showAxisLabels ? 44 : 0}
                />
                <Tooltip
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${gridColor}`,
                    borderRadius: '6px',
                    fontSize: 12,
                    color: tooltipFg,
                  }}
                />

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

          <div className={cn('mt-1 flex flex-wrap gap-x-4 gap-y-0.5', showAxisLabels ? 'ml-[44px]' : 'ml-0')} aria-hidden="true">
            {(tab === 'A' || tab === 'B') && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="inline-block h-2 w-4 rounded-sm" style={{ background: COLOR_MID }} />
                {t('chart.mid')}
              </span>
            )}
            {tab === 'C' && (
              <>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="inline-block h-2 w-4 rounded-sm" style={{ background: COLOR_BID }} />
                  {t('chart.bid')}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="inline-block h-2 w-4 rounded-sm" style={{ background: COLOR_ASK }} />
                  {t('chart.ask')}
                </span>
              </>
            )}
            {tab === 'gold' && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="inline-block h-2 w-4 rounded-sm" style={{ background: COLOR_GOLD }} />
                {t('chart.axisGold')}
              </span>
            )}
          </div>

          {showAxisLabels && (
            <p className={cn('mt-0.5 text-center text-[10px] text-muted-foreground', showAxisLabels ? 'ml-[44px]' : 'ml-0')}>
              {t('chart.axisDate')}
            </p>
          )}

          {showCombined && data.length > 0 && (() => {
            const firstDate = data[0]?.date?.slice(5) ?? '';
            const lastDate = data[data.length - 1]?.date?.slice(5) ?? '';
            const allValues: number[] = [];
            if (tab === 'A' || tab === 'B') data.forEach((d) => d.mid != null && allValues.push(d.mid));
            else if (tab === 'C') data.forEach((d) => { if (d.bid != null) allValues.push(d.bid); if (d.ask != null) allValues.push(d.ask); });
            else data.forEach((d) => d.cena != null && allValues.push(d.cena));
            const minVal = allValues.length ? Math.min(...allValues) : 0;
            const maxVal = allValues.length ? Math.max(...allValues) : 0;
            return (
              <div className="mt-2 rounded-md border border-border/50 bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
                <span className="mr-4">{t('chart.rangeDate', { from: firstDate, to: lastDate })}</span>
                <span>{t('chart.rangeValue', { min: formatAxisNumber(minVal), max: formatAxisNumber(maxVal) })}</span>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
