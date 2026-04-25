import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { X, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NbpRate, NbpGoldPrice, NbpTableEntry, NbpRateC } from '@/store/api/nbpApi';

/** Details for a selected exchange rate row (table A/B). */
export interface RateSelection {
  type: 'rate';
  rate: NbpRate;
  tableEntry: Pick<NbpTableEntry, 'no' | 'effectiveDate'>;
}

/** Details for a selected table C (buy/sell) rate row. */
export interface RateCSelection {
  type: 'rateC';
  rate: NbpRateC;
  effectiveDate: string;
}

/** Details for a selected gold price row. */
export interface GoldSelection {
  type: 'gold';
  goldPrice: NbpGoldPrice;
}

/** Union of possible detail panel selections. */
export type NbpSelection = RateSelection | RateCSelection | GoldSelection;

/** Props for the {@link NbpDetails} component. */
export interface NbpDetailsProps {
  /** The currently selected item, or null to hide the panel. */
  selection: NbpSelection | null;
  /** Callback fired when the user closes the panel. */
  onClose: () => void;
  /** Callback fired when the user navigates to the chart view for a rate code. */
  onNavigateToChart?: (code: string) => void;
}

/**
 * Slide-in details panel for the NBP page.
 * Renders rate or gold price details depending on the active selection.
 * Respects `prefers-reduced-motion` for animation.
 *
 * @param props - {@link NbpDetailsProps}
 * @returns The detail panel element, or null when no selection exists
 */
export function NbpDetails({ selection, onClose, onNavigateToChart }: NbpDetailsProps): React.JSX.Element | null {
  const { t } = useTranslation('nbp');
  const reducedMotion = useReducedMotion();

  if (!selection) return null;

  const key = selection.type === 'rate'
    ? selection.rate.code
    : selection.type === 'rateC'
      ? selection.rate.code
      : selection.goldPrice.data;

  return (
    <motion.aside
      key={key}
      initial={reducedMotion ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      aria-label={t('details.heading')}
      className={cn(
        'rounded-xl border border-border bg-background p-6',
        'sticky top-20',
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{t('details.heading')}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('details.close')}
          className={cn(
            'rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {selection.type === 'rate' && (
        <>
          <dl className="space-y-3 text-sm">
            <DetailRow label={t('details.currency')} value={selection.rate.currency} />
            <DetailRow
              label={t('details.code')}
              value={<span className="font-mono font-semibold">{selection.rate.code}</span>}
            />
            <DetailRow
              label={t('details.mid')}
              value={
                <span className="font-medium tabular-nums">
                  {selection.rate.mid.toFixed(4)}{' '}
                  <span className="text-muted-foreground">{t('details.unit')}</span>
                </span>
              }
            />
            <DetailRow label={t('details.date')} value={selection.tableEntry.effectiveDate} />
            <DetailRow label={t('details.tableNo')} value={selection.tableEntry.no} />
          </dl>

          {onNavigateToChart && (
            <button
              type="button"
              onClick={() => onNavigateToChart(selection.rate.code)}
              aria-label={t('grid.chartFor', { code: selection.rate.code })}
              className={cn(
                'mt-4 flex items-center gap-2 rounded-md border border-border px-3 py-1.5',
                'text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <BarChart2 size={14} aria-hidden="true" />
              {t('series.viewChart')}
            </button>
          )}
        </>
      )}

      {selection.type === 'rateC' && (
        <>
          <dl className="space-y-3 text-sm">
            <DetailRow label={t('details.currency')} value={selection.rate.currency} />
            <DetailRow
              label={t('details.code')}
              value={<span className="font-mono font-semibold">{selection.rate.code}</span>}
            />
            <DetailRow
              label={t('grid.bid')}
              value={
                <span className="font-medium tabular-nums text-green-600">
                  {selection.rate.bid.toFixed(4)}{' '}
                  <span className="text-muted-foreground">{t('details.unit')}</span>
                </span>
              }
            />
            <DetailRow
              label={t('grid.ask')}
              value={
                <span className="font-medium tabular-nums text-red-500">
                  {selection.rate.ask.toFixed(4)}{' '}
                  <span className="text-muted-foreground">{t('details.unit')}</span>
                </span>
              }
            />
            <DetailRow label={t('details.date')} value={selection.effectiveDate} />
          </dl>

          {onNavigateToChart && (
            <button
              type="button"
              onClick={() => onNavigateToChart(selection.rate.code)}
              aria-label={t('grid.chartFor', { code: selection.rate.code })}
              className={cn(
                'mt-4 flex items-center gap-2 rounded-md border border-border px-3 py-1.5',
                'text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <BarChart2 size={14} aria-hidden="true" />
              {t('series.viewChart')}
            </button>
          )}
        </>
      )}

      {selection.type === 'gold' && (
        <dl className="space-y-3 text-sm">
          <DetailRow label={t('details.date')} value={selection.goldPrice.data} />
          <DetailRow
            label={t('details.price')}
            value={
              <span className="font-medium tabular-nums">
                {selection.goldPrice.cena.toFixed(2)}{' '}
                <span className="text-muted-foreground">{t('details.priceUnit')}</span>
              </span>
            }
          />
        </dl>
      )}
    </motion.aside>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

export type { NbpSelection };
