import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

// Must mock localStorage before any module that reads it during import/init
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

import tableSettingsReducer, {
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
  selectGroupSettings,
  selectVisibleColumns,
  selectAxisPresentation,
  DEFAULT_COLUMNS,
  DEFAULT_LAYOUT,
  DEFAULT_CHART_SETTINGS,
  REQUIRED_COLUMNS,
  TABLE_ROWS_PER_PAGE_OPTIONS,
  TILE_ITEMS_PER_PAGE_OPTIONS,
  TILE_COLUMNS_OPTIONS,
} from './tableSettingsSlice';

const makeStore = (preloadedState?: Parameters<typeof configureStore>[0]['preloadedState']) =>
  configureStore({
    reducer: { tableSettings: tableSettingsReducer },
    preloadedState,
  });

beforeEach(() => {
  localStorageMock.clear();
  vi.restoreAllMocks();
});

describe('tableSettingsSlice – initial state', () => {
  it('starts with default columns for group A', () => {
    const store = makeStore();
    expect(selectVisibleColumns('A')(store.getState() as never)).toEqual(DEFAULT_COLUMNS.A);
  });

  it('starts with axisPresentation labels for all groups', () => {
    const store = makeStore();
    for (const g of ['A', 'B', 'C', 'gold'] as const) {
      expect(selectAxisPresentation(g)(store.getState() as never)).toBe('labels');
    }
  });

  it('starts with default layout settings for all groups', () => {
    const store = makeStore();
    for (const g of ['A', 'B', 'C', 'gold'] as const) {
      expect(selectGroupSettings(g)(store.getState() as never).layout).toEqual(DEFAULT_LAYOUT[g]);
    }
  });

  it('starts with default chart settings for all groups', () => {
    const store = makeStore();
    for (const g of ['A', 'B', 'C', 'gold'] as const) {
      expect(selectGroupSettings(g)(store.getState() as never).chart).toEqual(DEFAULT_CHART_SETTINGS[g]);
    }
  });
});

describe('setVisibleColumns', () => {
  it('sets visible columns for a group', () => {
    const store = makeStore();
    store.dispatch(setVisibleColumns({ group: 'A', columns: ['code', 'mid'] }));
    expect(selectVisibleColumns('A')(store.getState() as never)).toEqual(['code', 'mid']);
  });

  it('always keeps required columns even if omitted', () => {
    const store = makeStore();
    // Required for group A is ['code']; dispatch without it
    store.dispatch(setVisibleColumns({ group: 'A', columns: ['mid'] }));
    const visible = selectVisibleColumns('A')(store.getState() as never);
    expect(visible).toContain('code');
    expect(visible).toContain('mid');
  });

  it('deduplicates columns', () => {
    const store = makeStore();
    store.dispatch(setVisibleColumns({ group: 'A', columns: ['code', 'code', 'mid'] }));
    const visible = selectVisibleColumns('A')(store.getState() as never);
    expect(visible.filter((c) => c === 'code')).toHaveLength(1);
  });
});

describe('toggleColumn', () => {
  it('adds a hidden column', () => {
    const store = makeStore();
    store.dispatch(setVisibleColumns({ group: 'A', columns: ['code'] }));
    store.dispatch(toggleColumn({ group: 'A', column: 'mid' }));
    expect(selectVisibleColumns('A')(store.getState() as never)).toContain('mid');
  });

  it('removes a visible column', () => {
    const store = makeStore();
    store.dispatch(setVisibleColumns({ group: 'A', columns: ['code', 'mid'] }));
    store.dispatch(toggleColumn({ group: 'A', column: 'mid' }));
    expect(selectVisibleColumns('A')(store.getState() as never)).not.toContain('mid');
  });

  it('cannot toggle off a required column', () => {
    const store = makeStore();
    const requiredCol = REQUIRED_COLUMNS.A[0];
    store.dispatch(setVisibleColumns({ group: 'A', columns: ['code', 'mid'] }));
    store.dispatch(toggleColumn({ group: 'A', column: requiredCol }));
    expect(selectVisibleColumns('A')(store.getState() as never)).toContain(requiredCol);
  });
});

describe('setAxisPresentation', () => {
  it('sets tooltip mode', () => {
    const store = makeStore();
    store.dispatch(setAxisPresentation({ group: 'A', mode: 'tooltip' }));
    expect(selectAxisPresentation('A')(store.getState() as never)).toBe('tooltip');
  });

  it('sets combined mode for gold', () => {
    const store = makeStore();
    store.dispatch(setAxisPresentation({ group: 'gold', mode: 'combined' }));
    expect(selectAxisPresentation('gold')(store.getState() as never)).toBe('combined');
  });
});

describe('layout actions', () => {
  it('sets table rows per page', () => {
    const store = makeStore();
    store.dispatch(
      setTableRowsPerPage({ group: 'A', rowsPerPage: TABLE_ROWS_PER_PAGE_OPTIONS[0] }),
    );
    expect(selectGroupSettings('A')(store.getState() as never).layout.tableRowsPerPage).toBe(
      TABLE_ROWS_PER_PAGE_OPTIONS[0],
    );
  });

  it('sets tile items per page', () => {
    const store = makeStore();
    store.dispatch(
      setTileItemsPerPage({ group: 'A', itemsPerPage: TILE_ITEMS_PER_PAGE_OPTIONS[2] }),
    );
    expect(selectGroupSettings('A')(store.getState() as never).layout.tileItemsPerPage).toBe(
      TILE_ITEMS_PER_PAGE_OPTIONS[2],
    );
  });

  it('sets tile columns', () => {
    const store = makeStore();
    store.dispatch(setTileColumns({ group: 'A', columns: TILE_COLUMNS_OPTIONS[1] }));
    expect(selectGroupSettings('A')(store.getState() as never).layout.tileColumns).toBe(
      TILE_COLUMNS_OPTIONS[1],
    );
  });
});

describe('chart actions', () => {
  it('sets chart interaction mode', () => {
    const store = makeStore();
    store.dispatch(setChartInteractionMode({ group: 'A', mode: 'pinned' }));
    expect(selectGroupSettings('A')(store.getState() as never).chart.interactionMode).toBe('pinned');
  });

  it('toggles chart legend and grid visibility', () => {
    const store = makeStore();
    store.dispatch(setChartShowLegend({ group: 'A', showLegend: false }));
    store.dispatch(setChartShowGrid({ group: 'A', showGrid: false }));
    store.dispatch(setChartGaplessTimeline({ group: 'A', gaplessTimeline: false }));
    const chart = selectGroupSettings('A')(store.getState() as never).chart;
    expect(chart.showLegend).toBe(false);
    expect(chart.showGrid).toBe(false);
    expect(chart.gaplessTimeline).toBe(false);
  });

  it('sets chart range preset', () => {
    const store = makeStore();
    store.dispatch(setChartRangePreset({ group: 'A', rangePreset: '90d' }));
    expect(selectGroupSettings('A')(store.getState() as never).chart.rangePreset).toBe('90d');
  });
});

describe('resetGroup', () => {
  it('restores defaults for a specific group', () => {
    const store = makeStore();
    store.dispatch(setVisibleColumns({ group: 'C', columns: ['code'] }));
    store.dispatch(setAxisPresentation({ group: 'C', mode: 'combined' }));
    store.dispatch(setTableRowsPerPage({ group: 'C', rowsPerPage: 10 }));
    store.dispatch(setChartInteractionMode({ group: 'C', mode: 'off' }));
    store.dispatch(resetGroup({ group: 'C' }));
    const settings = selectGroupSettings('C')(store.getState() as never);
    expect(settings.visibleColumns).toEqual(DEFAULT_COLUMNS.C);
    expect(settings.axisPresentation).toBe('labels');
    expect(settings.layout).toEqual(DEFAULT_LAYOUT.C);
    expect(settings.chart).toEqual(DEFAULT_CHART_SETTINGS.C);
  });

  it('does not affect other groups', () => {
    const store = makeStore();
    store.dispatch(setAxisPresentation({ group: 'A', mode: 'tooltip' }));
    store.dispatch(resetGroup({ group: 'C' }));
    expect(selectAxisPresentation('A')(store.getState() as never)).toBe('tooltip');
  });
});

describe('resetAll', () => {
  it('restores defaults for all groups', () => {
    const store = makeStore();
    store.dispatch(setVisibleColumns({ group: 'A', columns: ['code'] }));
    store.dispatch(setAxisPresentation({ group: 'B', mode: 'combined' }));
    store.dispatch(setTileColumns({ group: 'B', columns: 2 }));
    store.dispatch(setChartShowGrid({ group: 'B', showGrid: false }));
    store.dispatch(resetAll());
    for (const g of ['A', 'B', 'C', 'gold'] as const) {
      expect(selectVisibleColumns(g)(store.getState() as never)).toEqual(DEFAULT_COLUMNS[g]);
      expect(selectAxisPresentation(g)(store.getState() as never)).toBe('labels');
      expect(selectGroupSettings(g)(store.getState() as never).layout).toEqual(DEFAULT_LAYOUT[g]);
      expect(selectGroupSettings(g)(store.getState() as never).chart).toEqual(DEFAULT_CHART_SETTINGS[g]);
    }
  });
});

describe('localStorage persistence', () => {
  it('persists state to localStorage on dispatch', () => {
    const store = makeStore();
    store.dispatch(setAxisPresentation({ group: 'A', mode: 'tooltip' }));
    store.dispatch(setTileColumns({ group: 'A', columns: 3 }));
    store.dispatch(setChartRangePreset({ group: 'A', rangePreset: '30d' }));
    const raw = localStorage.getItem('nbp:tableSettings');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as {
      groups: Record<
        string,
        { axisPresentation: string; layout: { tileColumns: number }; chart: { rangePreset: string } }
      >;
    };
    expect(parsed.groups.A.axisPresentation).toBe('tooltip');
    expect(parsed.groups.A.layout.tileColumns).toBe(3);
    expect(parsed.groups.A.chart.rangePreset).toBe('30d');
  });

  it('loads previously saved state from localStorage', () => {
    const saved = {
      groups: {
        A: {
          visibleColumns: ['code'],
          axisPresentation: 'combined',
          layout: { tableRowsPerPage: 10, tileItemsPerPage: 6, tileColumns: 2 },
          chart: { interactionMode: 'pinned', showLegend: false, showGrid: false, gaplessTimeline: false, rangePreset: '90d' },
        },
        B: {
          visibleColumns: ['code', 'currency', 'mid'],
          axisPresentation: 'labels',
          layout: { tableRowsPerPage: 20, tileItemsPerPage: 12, tileColumns: 4 },
          chart: { interactionMode: 'hover', showLegend: true, showGrid: true, gaplessTimeline: true, rangePreset: 'auto' },
        },
        C: {
          visibleColumns: ['code', 'currency', 'bid', 'ask'],
          axisPresentation: 'labels',
          layout: { tableRowsPerPage: 50, tileItemsPerPage: 24, tileColumns: 3 },
          chart: { interactionMode: 'pinned', showLegend: true, showGrid: false, gaplessTimeline: true, rangePreset: '30d' },
        },
        gold: {
          visibleColumns: ['date', 'price'],
          axisPresentation: 'labels',
          layout: { tableRowsPerPage: 20, tileItemsPerPage: 12, tileColumns: 4 },
          chart: { interactionMode: 'hover', showLegend: true, showGrid: true, gaplessTimeline: true, rangePreset: '7d' },
        },
      },
    };
    localStorage.setItem('nbp:tableSettings', JSON.stringify(saved));
    const store = makeStore();
    expect(selectVisibleColumns('A')(store.getState() as never)).toEqual(['code']);
    expect(selectAxisPresentation('A')(store.getState() as never)).toBe('combined');
    expect(selectGroupSettings('A')(store.getState() as never).layout).toEqual(
      saved.groups.A.layout,
    );
    expect(selectGroupSettings('A')(store.getState() as never).chart).toEqual(saved.groups.A.chart);
  });

  it('falls back to defaults when localStorage is malformed', () => {
    localStorage.setItem('nbp:tableSettings', 'not-json');
    const store = makeStore();
    expect(selectVisibleColumns('A')(store.getState() as never)).toEqual(DEFAULT_COLUMNS.A);
  });

  it('falls back to defaults for invalid layout values', () => {
    localStorage.setItem(
      'nbp:tableSettings',
      JSON.stringify({
        groups: {
          A: {
            visibleColumns: ['code'],
            axisPresentation: 'labels',
            layout: { tableRowsPerPage: 999, tileItemsPerPage: 999, tileColumns: 999 },
            chart: { interactionMode: 'invalid', showLegend: 'x', showGrid: 'y', gaplessTimeline: 'z', rangePreset: 'bad' },
          },
        },
      }),
    );
    const store = makeStore();
    expect(selectGroupSettings('A')(store.getState() as never).layout).toEqual(DEFAULT_LAYOUT.A);
    expect(selectGroupSettings('A')(store.getState() as never).chart).toEqual(DEFAULT_CHART_SETTINGS.A);
  });
});
