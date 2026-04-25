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

/** Available column keys per table group. */
export type ColumnKeyAB = 'code' | 'currency' | 'mid';
export type ColumnKeyC = 'code' | 'currency' | 'bid' | 'ask';
export type ColumnKeyGold = 'date' | 'price';
export type ColumnKey = ColumnKeyAB | ColumnKeyC | ColumnKeyGold;

/** Per-group settings stored in Redux. */
export interface GroupSettings {
  /** Which columns are visible (must include at least one). */
  visibleColumns: ColumnKey[];
  /** Chart axis presentation mode. */
  axisPresentation: AxisPresentation;
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

const LS_KEY = 'nbp:tableSettings';

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
      A: { visibleColumns: [...DEFAULT_COLUMNS.A], axisPresentation: 'labels' },
      B: { visibleColumns: [...DEFAULT_COLUMNS.B], axisPresentation: 'labels' },
      C: { visibleColumns: [...DEFAULT_COLUMNS.C], axisPresentation: 'labels' },
      gold: { visibleColumns: [...DEFAULT_COLUMNS.gold], axisPresentation: 'labels' },
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

    /** Reset a specific group to its defaults. */
    resetGroup(state, action: PayloadAction<{ group: NbpTableGroup }>) {
      const { group } = action.payload;
      state.groups[group] = {
        visibleColumns: [...DEFAULT_COLUMNS[group]],
        axisPresentation: 'labels',
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

export default tableSettingsSlice.reducer;
