import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/useBreakpoint';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  toggleColumn,
  setAxisPresentation,
  setTableRowsPerPage,
  setTileItemsPerPage,
  setTileColumns,
  setChartInteractionMode,
  setChartShowLegend,
  setChartShowGrid,
  setChartGaplessTimeline,
  setChartRangePreset,
  resetGroup,
  selectGroupSettings,
  DEFAULT_COLUMNS,
  REQUIRED_COLUMNS,
  TABLE_ROWS_PER_PAGE_OPTIONS,
  TILE_ITEMS_PER_PAGE_OPTIONS,
  TILE_COLUMNS_OPTIONS,
} from '@/store/slices/tableSettingsSlice';
import type {
  NbpTableGroup,
  AxisPresentation,
  ColumnKey,
  TableRowsPerPage,
  TileItemsPerPage,
  TileColumns,
  ChartRangePreset,
} from '@/store/slices/tableSettingsSlice';

const COLUMN_LABELS: Record<ColumnKey, string> = {
  code: 'Code',
  currency: 'Currency',
  mid: 'Mid rate',
  bid: 'Buy rate',
  ask: 'Sell rate',
  date: 'Date',
  price: 'Price',
};

function SettingHelp({ text }: { text: string }): React.JSX.Element {
  return (
    <span className="group relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={text}
        title={text}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info size={10} aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2',
          'rounded-md border border-border bg-popover px-2 py-1.5 text-[10px] leading-snug text-popover-foreground shadow-lg',
          'group-hover:block group-focus-within:block',
        )}
      >
        {text}
      </span>
    </span>
  );
}

type MobileSectionKey = 'columns' | 'layout' | 'chart' | 'axis';

function MobileAccordionSection({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
      >
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{summary}</div>
        </div>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn('shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && <div className="border-t border-border px-3 py-3">{children}</div>}
    </div>
  );
}

export interface TableSettingsModalProps {
  open: boolean;
  onClose: () => void;
  group: NbpTableGroup;
  viewMode?: 'grid' | 'chart' | 'tiles';
}

export function TableSettingsModal({
  open,
  onClose,
  group,
  viewMode = 'grid',
}: TableSettingsModalProps): React.JSX.Element | null {
  const { t } = useTranslation('nbp');
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const settings = useAppSelector(selectGroupSettings(group));
  const [mobileOpenSection, setMobileOpenSection] = useState<MobileSectionKey | null>(
    viewMode === 'chart' ? 'chart' : 'layout',
  );

  const allColumns = DEFAULT_COLUMNS[group];
  const required = REQUIRED_COLUMNS[group];
  const visible = settings.visibleColumns;
  const layout = settings.layout;
  const chart = settings.chart;
  const rowsPerPageId = `rows-per-page-${group}`;
  const tileItemsPerPageId = `tile-items-per-page-${group}`;
  const tileColumnsId = `tile-columns-${group}`;
  const showLegendId = `show-legend-${group}`;
  const showGridId = `show-grid-${group}`;
  const gaplessTimelineId = `gapless-timeline-${group}`;
  if (!open) return null;

  const axisModes: { value: AxisPresentation; label: string }[] = [
    { value: 'labels', label: t('settings.axisLabels') },
    { value: 'tooltip', label: t('settings.axisTooltip') },
    { value: 'combined', label: t('settings.axisCombined') },
  ];

  const columnsSummary = `${visible.length}/${allColumns.length}`;
  const layoutSummary = `${layout.tableRowsPerPage} ${t('settings.rows')} · ${layout.tileItemsPerPage} ${t('settings.tiles')} · ${layout.tileColumns} ${t('settings.cols')}`;
  const chartSummary = [
    chart.interactionMode === 'hover'
      ? t('settings.chartHover')
      : chart.interactionMode === 'pinned'
        ? t('settings.chartPinned')
        : t('settings.chartOff'),
    `${t('settings.showLegend')}: ${chart.showLegend ? t('settings.on') : t('settings.off')}`,
    `${t('settings.showGrid')}: ${chart.showGrid ? t('settings.on') : t('settings.off')}`,
    `${t('settings.gaplessTimeline')}: ${chart.gaplessTimeline ? t('settings.on') : t('settings.off')}`,
  ].join(' · ');
  const axisSummary =
    settings.axisPresentation === 'labels'
      ? t('settings.axisLabels')
      : settings.axisPresentation === 'tooltip'
        ? t('settings.axisTooltip')
        : t('settings.axisCombined');

  const renderColumnsBody = (): React.JSX.Element => (
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
  );

  const renderLayoutBody = (): React.JSX.Element => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted/50">
        <div className="flex min-w-0 items-center gap-1">
          <label htmlFor={rowsPerPageId}>{t('settings.rowsPerPage')}</label>
          <SettingHelp text={t('settings.rowsPerPageHelp')} />
        </div>
        <select
          id={rowsPerPageId}
          value={layout.tableRowsPerPage}
          onChange={(e) =>
            dispatch(
              setTableRowsPerPage({
                group,
                rowsPerPage: Number(e.target.value) as TableRowsPerPage,
              }),
            )
          }
          className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground dark:[color-scheme:dark]"
        >
          {TABLE_ROWS_PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted/50">
        <div className="flex min-w-0 items-center gap-1">
          <label htmlFor={tileItemsPerPageId}>{t('settings.tileItemsPerPage')}</label>
          <SettingHelp text={t('settings.tileItemsPerPageHelp')} />
        </div>
        <select
          id={tileItemsPerPageId}
          value={layout.tileItemsPerPage}
          onChange={(e) =>
            dispatch(
              setTileItemsPerPage({
                group,
                itemsPerPage: Number(e.target.value) as TileItemsPerPage,
              }),
            )
          }
          className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground dark:[color-scheme:dark]"
        >
          {TILE_ITEMS_PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted/50">
        <div className="flex min-w-0 items-center gap-1">
          <label htmlFor={tileColumnsId}>{t('settings.tileColumns')}</label>
          <SettingHelp text={t('settings.tileColumnsHelp')} />
        </div>
        <select
          id={tileColumnsId}
          value={layout.tileColumns}
          onChange={(e) =>
            dispatch(
              setTileColumns({
                group,
                columns: Number(e.target.value) as TileColumns,
              }),
            )
          }
          className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground dark:[color-scheme:dark]"
        >
          {TILE_COLUMNS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderChartBody = (): React.JSX.Element => (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => dispatch(setChartInteractionMode({ group, mode: 'hover' }))}
          title={t('settings.chartHoverHelp')}
          className={cn(
            'rounded-md border px-2 py-1.5 text-xs transition-colors',
            chart.interactionMode === 'hover'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          {t('settings.chartHover')}
        </button>
        <button
          type="button"
          onClick={() => dispatch(setChartInteractionMode({ group, mode: 'pinned' }))}
          title={t('settings.chartPinnedHelp')}
          className={cn(
            'rounded-md border px-2 py-1.5 text-xs transition-colors',
            chart.interactionMode === 'pinned'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          {t('settings.chartPinned')}
        </button>
        <button
          type="button"
          onClick={() => dispatch(setChartInteractionMode({ group, mode: 'off' }))}
          title={t('settings.chartOffHelp')}
          className={cn(
            'rounded-md border px-2 py-1.5 text-xs transition-colors',
            chart.interactionMode === 'off'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          {t('settings.chartOff')}
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted/50">
        <div className="flex min-w-0 items-center gap-1">
          <label htmlFor={showLegendId}>{t('settings.showLegend')}</label>
          <SettingHelp text={t('settings.showLegendHelp')} />
        </div>
        <input
          id={showLegendId}
          type="checkbox"
          checked={chart.showLegend}
          onChange={(e) => dispatch(setChartShowLegend({ group, showLegend: e.target.checked }))}
          className="accent-primary"
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted/50">
        <div className="flex min-w-0 items-center gap-1">
          <label htmlFor={showGridId}>{t('settings.showGrid')}</label>
          <SettingHelp text={t('settings.showGridHelp')} />
        </div>
        <input
          id={showGridId}
          type="checkbox"
          checked={chart.showGrid}
          onChange={(e) => dispatch(setChartShowGrid({ group, showGrid: e.target.checked }))}
          className="accent-primary"
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted/50">
        <div className="flex min-w-0 items-center gap-1">
          <label htmlFor={gaplessTimelineId}>{t('settings.gaplessTimeline')}</label>
          <SettingHelp text={t('settings.gaplessTimelineHelp')} />
        </div>
        <input
          id={gaplessTimelineId}
          type="checkbox"
          checked={chart.gaplessTimeline}
          onChange={(e) => dispatch(setChartGaplessTimeline({ group, gaplessTimeline: e.target.checked }))}
          className="accent-primary"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(['auto', '7d', '30d', '90d', '180d', '365d'] as ChartRangePreset[]).map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => dispatch(setChartRangePreset({ group, rangePreset: preset }))}
            title={t(`settings.range${preset === 'auto' ? 'Auto' : preset.toUpperCase()}Help`)}
            className={cn(
              'rounded-md border px-2 py-1.5 text-xs transition-colors',
              chart.rangePreset === preset
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`settings.range${preset === 'auto' ? 'Auto' : preset.toUpperCase()}`)}
          </button>
        ))}
      </div>
    </div>
  );

  const renderAxisBody = (): React.JSX.Element => (
    <div className="flex flex-col gap-2">
      {axisModes.map(({ value, label }) => (
        <label
          key={value}
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted/50"
          title={t(`settings.axis${value.charAt(0).toUpperCase() + value.slice(1)}Help`)}
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
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('grid.settings')}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative z-10 w-full rounded-t-xl border border-border bg-background shadow-xl',
          'sm:max-w-sm sm:rounded-xl',
        )}
      >
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

        <div className="px-4 py-3">
          {isMobile ? (
            <div className="flex flex-col gap-3">
              <MobileAccordionSection
                title={t('settings.columns')}
                summary={columnsSummary}
                open={mobileOpenSection === 'columns'}
                onToggle={() =>
                  setMobileOpenSection((current) => (current === 'columns' ? null : 'columns'))
                }
              >
                {renderColumnsBody()}
              </MobileAccordionSection>

              <MobileAccordionSection
                title={t('settings.layout')}
                summary={layoutSummary}
                open={mobileOpenSection === 'layout'}
                onToggle={() =>
                  setMobileOpenSection((current) => (current === 'layout' ? null : 'layout'))
                }
              >
                {renderLayoutBody()}
              </MobileAccordionSection>

              <MobileAccordionSection
                title={t('settings.chart')}
                summary={chartSummary}
                open={mobileOpenSection === 'chart'}
                onToggle={() =>
                  setMobileOpenSection((current) => (current === 'chart' ? null : 'chart'))
                }
              >
                {renderChartBody()}
              </MobileAccordionSection>

              {group !== 'gold' && (
                <MobileAccordionSection
                  title={t('settings.axisMode')}
                  summary={axisSummary}
                  open={mobileOpenSection === 'axis'}
                  onToggle={() =>
                    setMobileOpenSection((current) => (current === 'axis' ? null : 'axis'))
                  }
                >
                  {renderAxisBody()}
                </MobileAccordionSection>
              )}
            </div>
          ) : (
            <>
              <fieldset className="mb-4">
                <legend className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('settings.columns')}
                </legend>
                {renderColumnsBody()}
              </fieldset>

              <fieldset className="mb-4">
                <legend className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span className="inline-flex items-center gap-1">
                    {t('settings.layout')}
                    <SettingHelp text={t('settings.layoutHelp')} />
                  </span>
                </legend>
                {renderLayoutBody()}
              </fieldset>

              <fieldset className="mb-4">
                <legend className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span className="inline-flex items-center gap-1">
                    {t('settings.chart')}
                    <SettingHelp text={t('settings.chartHelp')} />
                  </span>
                </legend>
                {renderChartBody()}
              </fieldset>

              {group !== 'gold' && (
                <fieldset className="mb-4">
                  <legend className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1">
                      {t('settings.axisMode')}
                      <SettingHelp text={t('settings.axisModeHelp')} />
                    </span>
                  </legend>
                  {renderAxisBody()}
                </fieldset>
              )}
            </>
          )}
        </div>

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
