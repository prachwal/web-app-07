import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  toggleColumn,
  setAxisPresentation,
  resetGroup,
  selectGroupSettings,
  DEFAULT_COLUMNS,
  REQUIRED_COLUMNS,
} from '@/store/slices/tableSettingsSlice';
import type { NbpTableGroup, AxisPresentation, ColumnKey } from '@/store/slices/tableSettingsSlice';

/** Label map for column keys per group. */
const COLUMN_LABELS: Record<ColumnKey, string> = {
  code: 'Code',
  currency: 'Currency',
  mid: 'Mid rate',
  bid: 'Buy rate',
  ask: 'Sell rate',
  date: 'Date',
  price: 'Price',
};

/** Props for the {@link TableSettingsModal} component. */
export interface TableSettingsModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user closes the modal. */
  onClose: () => void;
  /** Table group whose settings are being edited. */
  group: NbpTableGroup;
}

/**
 * Modal for editing per-table-group column visibility and axis presentation mode.
 *
 * @param props - {@link TableSettingsModalProps}
 */
export function TableSettingsModal({ open, onClose, group }: TableSettingsModalProps): React.JSX.Element | null {
  const { t } = useTranslation('nbp');
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectGroupSettings(group));

  if (!open) return null;

  const allColumns = DEFAULT_COLUMNS[group];
  const required = REQUIRED_COLUMNS[group];
  const visible = settings.visibleColumns;

  const axisModes: { value: AxisPresentation; label: string }[] = [
    { value: 'labels', label: t('settings.axisLabels') },
    { value: 'tooltip', label: t('settings.axisTooltip') },
    { value: 'combined', label: t('settings.axisCombined') },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('grid.settings')}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full rounded-t-xl border border-border bg-background shadow-xl',
          'sm:max-w-sm sm:rounded-xl',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{t('grid.settings')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common:close')}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          {/* Column visibility */}
          <fieldset className="mb-4">
            <legend className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('settings.columns')}
            </legend>
            <div className="flex flex-col gap-2">
              {allColumns.map((col) => {
                const isRequired = required.includes(col);
                const isChecked = visible.includes(col);
                return (
                  <label
                    key={col}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1',
                      'text-sm transition-colors hover:bg-muted/50',
                      isRequired && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isRequired}
                      onChange={() => dispatch(toggleColumn({ group, column: col }))}
                      className="accent-primary"
                    />
                    <span>{COLUMN_LABELS[col]}</span>
                    {isRequired && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {t('settings.required')}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Axis presentation — only for non-gold groups */}
          {group !== 'gold' && (
            <fieldset className="mb-4">
              <legend className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('settings.axisMode')}
              </legend>
              <div className="flex flex-col gap-2">
                {axisModes.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted/50"
                  >
                    <input
                      type="radio"
                      name={`axis-${group}`}
                      value={value}
                      checked={settings.axisPresentation === value}
                      onChange={() => dispatch(setAxisPresentation({ group, mode: value }))}
                      className="accent-primary"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={() => dispatch(resetGroup({ group }))}
            className="rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('settings.reset')}
          </button>
        </div>
      </div>
    </div>
  );
}
