import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear: () => void;
  compact?: boolean;
  showLabels?: boolean;
  clearVariant?: 'destructive' | 'neutral';
}

/**
 * Reusable date range picker with compact (icon-only) and full (labelled input) modes.
 * Replaces duplicated date blocks in NbpFilters for gold and chart tabs.
 */
export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  compact = false,
  showLabels = true,
  clearVariant = 'neutral',
}: DateRangePickerProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const dateInputClass = cn(
    'rounded-md border border-border bg-background px-3 py-2 text-sm',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Start date */}
      {compact ? (
        <div className="flex flex-col items-center gap-0.5">
          {showLabels && (
            <span className="text-xs font-medium text-muted-foreground">{t('filters.startDate')}</span>
          )}
          <button
            type="button"
            aria-label={t('filters.startDate')}
            onClick={() => startRef.current?.showPicker()}
            className={cn(
              'rounded-md border border-border p-2 text-muted-foreground transition-colors',
              'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              startDate && 'border-primary text-primary',
            )}
          >
            <Calendar size={16} aria-hidden="true" />
          </button>
          <input
            ref={startRef}
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
          <span className="text-xs font-medium text-muted-foreground">{t('filters.startDate')}</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            aria-label={t('filters.startDate')}
            className={dateInputClass}
          />
        </label>
      )}

      {/* End date */}
      {compact ? (
        <div className="flex flex-col items-center gap-0.5">
          {showLabels && (
            <span className="text-xs font-medium text-muted-foreground">{t('filters.endDate')}</span>
          )}
          <button
            type="button"
            aria-label={t('filters.endDate')}
            onClick={() => endRef.current?.showPicker()}
            className={cn(
              'rounded-md border border-border p-2 text-muted-foreground transition-colors',
              'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              endDate && 'border-primary text-primary',
            )}
          >
            <Calendar size={16} aria-hidden="true" />
          </button>
          <input
            ref={endRef}
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
          <span className="text-xs font-medium text-muted-foreground">{t('filters.endDate')}</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            aria-label={t('filters.endDate')}
            className={dateInputClass}
          />
        </label>
      )}

      {/* Clear / reset */}
      {compact ? (
        <button
          type="button"
          aria-label={t('filters.clear')}
          onClick={onClear}
          className={cn(
            'rounded-md border p-2 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            clearVariant === 'destructive'
              ? 'border-destructive/50 text-destructive hover:bg-destructive/10'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            'ml-auto flex items-center gap-2 rounded-md border px-3 py-2',
            'text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            clearVariant === 'destructive'
              ? 'border-destructive/50 text-destructive hover:bg-destructive/10'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          <X size={14} aria-hidden="true" />
          {t('filters.clear')}
        </button>
      )}
    </div>
  );
}
