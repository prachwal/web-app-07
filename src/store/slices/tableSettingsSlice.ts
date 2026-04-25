import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

// ── Types ──────────────────────────────────────────────────────────────────

/** Which data table group this setting applies to. */
export type NbpTableGroup = 'A' | 'B' | 'C' | 'gold';

/**
 * How axis labels are presented in the chart.
 * - `'labels'` – standard SVG axis tick labels (default)
 * - `'tooltip'` – labels hidden; values shown on hover tooltip only
 * - `'combined'` – labels hidden; a compact summary box below the chart shows X/Y info
 */
export type AxisPresentation = 'labels' | 'tooltip' | 'combined';

/** Chart interaction mode for the historical series view. */
export type ChartInteractionMode = 'hover' | 'pinned' | 'off';

/** Quick date-range presets for the chart view. */
export type ChartRangePreset = 'auto' | '7d' | '30d' | '90d' | '180d' | '365d';

/** Rows per page options for table views. */
export const TABLE_ROWS_PER_PAGE_OPTIONS = [10, 20, 50] as const;

/** Allowed rows per page values for table views. */
export type TableRowsPerPage = (typeof TABLE_ROWS_PER_PAGE_OPTIONS)[number];

/** Tile cards per page options for tiles views. */
export const TILE_ITEMS_PER_PAGE_OPTIONS = [6, 12, 24] as const;

/** Allowed cards per page values for tiles views. */
export type TileItemsPerPage = (typeof TILE_ITEMS_PER_PAGE_OPTIONS)[number];

/** Tile column count options for tiles views. */
export const TILE_COLUMNS_OPTIONS = [2, 3, 4] as const;

/** Allowed tile column counts. */
export type TileColumns = (typeof TILE_COLUMNS_OPTIONS)[number];

/** Available column keys per table group. */
export type ColumnKeyAB = 'code' | 'currency' | 'mid';
export type ColumnKeyC = 'code' | 'currency' | 'bid' | 'ask';
export type ColumnKeyGold = 'date' | 'price';
export type ColumnKey = ColumnKeyAB | ColumnKeyC | ColumnKeyGold;

/** Layout settings used by table and tiles views. */
export interface GroupLayoutSettings {
  /** Table rows shown per page. */
  tableRowsPerPage: TableRowsPerPage;
  /** Cards shown per page in the tiles view. */
  tileItemsPerPage: TileItemsPerPage;
  /** Maximum tile columns for the responsive grid. */
  tileColumns: TileColumns;
}

/** Chart-specific settings used by the historical series view. */
export interface GroupChartSettings {
  /** How the chart should react to pointer input. */
  interactionMode: ChartInteractionMode;
  /** Whether the legend is visible. */
  showLegend: boolean;
  /** Whether grid lines and axis lines are visible. */
  showGrid: boolean;
  /** Whether missing calendar days are filled so the line runs continuously. */
  gaplessTimeline: boolean;
  /** Active time-range preset used by the chart controls. */
  rangePreset: ChartRangePreset;
}

/** Per-group settings stored in Redux. */
export interface GroupSettings {
  /** Which columns are visible (must include at least one). */
  visibleColumns: ColumnKey[];
  /** Chart axis presentation mode. */
  axisPresentation: AxisPresentation;
  /** Layout-related controls for the active group. */
  layout: GroupLayoutSettings;
  /** Chart-specific controls for the active group. */
  chart: GroupChartSettings;
}

/** State shape: one entry per table group. */
export interface TableSettingsState {
  groups: Record<NbpTableGroup, GroupSettings>;
}

// ── Default column sets ────────────────────────────────────────────────────

export const DEFAULT_COLUMNS: Record<NbpTableGroup, ColumnKey[]> = {
  A: ['code', 'currency', 'mid'],
  B: ['code', 'currency', 'mid'],
  C: ['code', 'currency', 'bid', 'ask'],
  gold: ['date', 'price'],
};

/** Minimum required columns so the table is always usable. */
export const REQUIRED_COLUMNS: Record<NbpTableGroup, ColumnKey[]> = {
  A: ['code'],
  B: ['code'],
  C: ['code'],
  gold: ['date'],
};

/** Default layout settings per table group. */
export const DEFAULT_LAYOUT: Record<NbpTableGroup, GroupLayoutSettings> = {
  A: { tableRowsPerPage: 20, tileItemsPerPage: 12, tileColumns: 4 },
  B: { tableRowsPerPage: 20, tileItemsPerPage: 12, tileColumns: 4 },
  C: { tableRowsPerPage: 20, tileItemsPerPage: 12, tileColumns: 4 },
  gold: { tableRowsPerPage: 20, tileItemsPerPage: 12, tileColumns: 4 },
};

/** Default chart settings per table group. */
export const DEFAULT_CHART_SETTINGS: Record<NbpTableGroup, GroupChartSettings> = {
  A: { interactionMode: 'hover', showLegend: true, showGrid: true, gaplessTimeline: true, rangePreset: 'auto' },
  B: { interactionMode: 'hover', showLegend: true, showGrid: true, gaplessTimeline: true, rangePreset: 'auto' },
  C: { interactionMode: 'pinned', showLegend: true, showGrid: true, gaplessTimeline: true, rangePreset: 'auto' },
  gold: { interactionMode: 'hover', showLegend: true, showGrid: true, gaplessTimeline: true, rangePreset: 'auto' },
};

const LS_KEY = 'nbp:tableSettings';

function pickOption<T extends number>(options: readonly T[], value: unknown, fallback: T): T {
  return typeof value === 'number' && options.includes(value as T) ? (value as T) : fallback;
}

function normalizeLayout(
  saved: Partial<GroupLayoutSettings> | undefined,
  group: NbpTableGroup,
): GroupLayoutSettings {
  const defaults = DEFAULT_LAYOUT[group];
  return {
    tableRowsPerPage: pickOption(
      TABLE_ROWS_PER_PAGE_OPTIONS,
      saved?.tableRowsPerPage,
      defaults.tableRowsPerPage,
    ),
    tileItemsPerPage: pickOption(
      TILE_ITEMS_PER_PAGE_OPTIONS,
      saved?.tileItemsPerPage,
      defaults.tileItemsPerPage,
    ),
    tileColumns: pickOption(TILE_COLUMNS_OPTIONS, saved?.tileColumns, defaults.tileColumns),
  };
}

function normalizeChartSettings(
  saved: Partial<GroupChartSettings> | undefined,
  group: NbpTableGroup,
): GroupChartSettings {
  const defaults = DEFAULT_CHART_SETTINGS[group];
  const isValidRangePreset = (
    value: unknown,
  ): value is ChartRangePreset =>
    value === 'auto' ||
    value === '7d' ||
    value === '30d' ||
    value === '90d' ||
    value === '180d' ||
    value === '365d';
  return {
    interactionMode:
      saved?.interactionMode === 'hover' || saved?.interactionMode === 'pinned' || saved?.interactionMode === 'off'
        ? saved.interactionMode
        : defaults.interactionMode,
    showLegend: typeof saved?.showLegend === 'boolean' ? saved.showLegend : defaults.showLegend,
    showGrid: typeof saved?.showGrid === 'boolean' ? saved.showGrid : defaults.showGrid,
    gaplessTimeline:
      typeof saved?.gaplessTimeline === 'boolean' ? saved.gaplessTimeline : defaults.gaplessTimeline,
    rangePreset: isValidRangePreset(saved?.rangePreset) ? saved.rangePreset : defaults.rangePreset,
  };
}

/** Read persisted settings from localStorage, falling back to defaults. */
function loadFromStorage(): TableSettingsState {
  const defaults = buildDefaultState();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<TableSettingsState>;
    // Merge so new keys added later always have defaults
    const groups = { ...defaults.groups };
    for (const g of Object.keys(groups) as NbpTableGroup[]) {
      const saved = parsed.groups?.[g];
      if (saved) {
        groups[g] = {
          visibleColumns: saved.visibleColumns?.length ? saved.visibleColumns : defaults.groups[g].visibleColumns,
          axisPresentation: saved.axisPresentation ?? 'labels',
          layout: normalizeLayout(saved.layout, g),
          chart: normalizeChartSettings(saved.chart, g),
        };
      }
    }
    return { groups };
  } catch {
    return defaults;
  }
}

function buildDefaultState(): TableSettingsState {
  return {
    groups: {
      A: {
        visibleColumns: [...DEFAULT_COLUMNS.A],
        axisPresentation: 'labels',
        layout: { ...DEFAULT_LAYOUT.A },
        chart: { ...DEFAULT_CHART_SETTINGS.A },
      },
      B: {
        visibleColumns: [...DEFAULT_COLUMNS.B],
        axisPresentation: 'labels',
        layout: { ...DEFAULT_LAYOUT.B },
        chart: { ...DEFAULT_CHART_SETTINGS.B },
      },
      C: {
        visibleColumns: [...DEFAULT_COLUMNS.C],
        axisPresentation: 'labels',
        layout: { ...DEFAULT_LAYOUT.C },
        chart: { ...DEFAULT_CHART_SETTINGS.C },
      },
      gold: {
        visibleColumns: [...DEFAULT_COLUMNS.gold],
        axisPresentation: 'labels',
        layout: { ...DEFAULT_LAYOUT.gold },
        chart: { ...DEFAULT_CHART_SETTINGS.gold },
      },
    },
  };
}

/** Persist current state to localStorage. */
function persist(state: TableSettingsState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode — ignore
  }
}

// ── Slice ──────────────────────────────────────────────────────────────────

/**
 * Redux slice for per-table-group display settings.
 * Settings are persisted to localStorage on every change.
 *
 * @see {@link GroupSettings} for the per-group shape.
 */
const tableSettingsSlice = createSlice({
  name: 'tableSettings',
  initialState: (): TableSettingsState => loadFromStorage(),
  reducers: {
    /**
     * Set the visible columns for a specific table group.
     * The required column for that group is always kept even if omitted.
     */
    setVisibleColumns(
      state,
      action: PayloadAction<{ group: NbpTableGroup; columns: ColumnKey[] }>,
    ) {
      const { group, columns } = action.payload;
      const required = REQUIRED_COLUMNS[group];
      // Ensure required columns are always present
      const merged = Array.from(new Set([...required, ...columns]));
      state.groups[group].visibleColumns = merged;
      persist(state);
    },

    /** Toggle a single column on/off for a group. */
    toggleColumn(
      state,
      action: PayloadAction<{ group: NbpTableGroup; column: ColumnKey }>,
    ) {
      const { group, column } = action.payload;
      const required = REQUIRED_COLUMNS[group];
      const current = state.groups[group].visibleColumns;
      if (required.includes(column)) return; // required columns cannot be toggled off
      if (current.includes(column)) {
        state.groups[group].visibleColumns = current.filter((c) => c !== column);
      } else {
        state.groups[group].visibleColumns = [...current, column];
      }
      persist(state);
    },

    /** Set the axis presentation mode for a group. */
    setAxisPresentation(
      state,
      action: PayloadAction<{ group: NbpTableGroup; mode: AxisPresentation }>,
    ) {
      const { group, mode } = action.payload;
      state.groups[group].axisPresentation = mode;
      persist(state);
    },

    /** Set table rows per page for a group. */
    setTableRowsPerPage(
      state,
      action: PayloadAction<{ group: NbpTableGroup; rowsPerPage: TableRowsPerPage }>,
    ) {
      const { group, rowsPerPage } = action.payload;
      state.groups[group].layout.tableRowsPerPage = rowsPerPage;
      persist(state);
    },

    /** Set tile cards per page for a group. */
    setTileItemsPerPage(
      state,
      action: PayloadAction<{ group: NbpTableGroup; itemsPerPage: TileItemsPerPage }>,
    ) {
      const { group, itemsPerPage } = action.payload;
      state.groups[group].layout.tileItemsPerPage = itemsPerPage;
      persist(state);
    },

    /** Set the responsive tile grid column count for a group. */
    setTileColumns(
      state,
      action: PayloadAction<{ group: NbpTableGroup; columns: TileColumns }>,
    ) {
      const { group, columns } = action.payload;
      state.groups[group].layout.tileColumns = columns;
      persist(state);
    },

    /** Set the chart interaction mode for a group. */
    setChartInteractionMode(
      state,
      action: PayloadAction<{ group: NbpTableGroup; mode: ChartInteractionMode }>,
    ) {
      const { group, mode } = action.payload;
      state.groups[group].chart.interactionMode = mode;
      persist(state);
    },

    /** Set whether the chart legend is visible for a group. */
    setChartShowLegend(
      state,
      action: PayloadAction<{ group: NbpTableGroup; showLegend: boolean }>,
    ) {
      const { group, showLegend } = action.payload;
      state.groups[group].chart.showLegend = showLegend;
      persist(state);
    },

    /** Set whether the chart grid is visible for a group. */
    setChartShowGrid(
      state,
      action: PayloadAction<{ group: NbpTableGroup; showGrid: boolean }>,
    ) {
      const { group, showGrid } = action.payload;
      state.groups[group].chart.showGrid = showGrid;
      persist(state);
    },

    /** Set whether the chart timeline should remain continuous across missing days. */
    setChartGaplessTimeline(
      state,
      action: PayloadAction<{ group: NbpTableGroup; gaplessTimeline: boolean }>,
    ) {
      const { group, gaplessTimeline } = action.payload;
      state.groups[group].chart.gaplessTimeline = gaplessTimeline;
      persist(state);
    },

    /** Set the chart range preset for a group. */
    setChartRangePreset(
      state,
      action: PayloadAction<{ group: NbpTableGroup; rangePreset: ChartRangePreset }>,
    ) {
      const { group, rangePreset } = action.payload;
      state.groups[group].chart.rangePreset = rangePreset;
      persist(state);
    },

    /** Reset a specific group to its defaults. */
    resetGroup(state, action: PayloadAction<{ group: NbpTableGroup }>) {
      const { group } = action.payload;
      state.groups[group] = {
        visibleColumns: [...DEFAULT_COLUMNS[group]],
        axisPresentation: 'labels',
        layout: { ...DEFAULT_LAYOUT[group] },
        chart: { ...DEFAULT_CHART_SETTINGS[group] },
      };
      persist(state);
    },

    /** Reset all groups to their defaults. */
    resetAll(state) {
      const defaults = buildDefaultState();
      state.groups = defaults.groups;
      persist(state);
    },
  },
});

export const {
  setVisibleColumns,
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
  resetAll,
} = tableSettingsSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────

/** Returns the full settings for a table group. */
export const selectGroupSettings = (group: NbpTableGroup) => (state: RootState) =>
  state.tableSettings.groups[group];

/** Returns the visible columns for a table group. */
export const selectVisibleColumns = (group: NbpTableGroup) => (state: RootState) =>
  state.tableSettings.groups[group].visibleColumns;

/** Returns the axis presentation mode for a table group. */
export const selectAxisPresentation = (group: NbpTableGroup) => (state: RootState) =>
  state.tableSettings.groups[group].axisPresentation;

/** Returns the layout settings for a table group. */
export const selectGroupLayoutSettings = (group: NbpTableGroup) => (state: RootState) =>
  state.tableSettings.groups[group].layout;

/** Returns the chart settings for a table group. */
export const selectGroupChartSettings = (group: NbpTableGroup) => (state: RootState) =>
  state.tableSettings.groups[group].chart;

export default tableSettingsSlice.reducer;
