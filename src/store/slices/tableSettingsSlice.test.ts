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
  resetGroup,
  resetAll,
  selectGroupSettings,
  selectVisibleColumns,
  selectAxisPresentation,
  DEFAULT_COLUMNS,
  REQUIRED_COLUMNS,
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

describe('resetGroup', () => {
  it('restores defaults for a specific group', () => {
    const store = makeStore();
    store.dispatch(setVisibleColumns({ group: 'C', columns: ['code'] }));
    store.dispatch(setAxisPresentation({ group: 'C', mode: 'combined' }));
    store.dispatch(resetGroup({ group: 'C' }));
    const settings = selectGroupSettings('C')(store.getState() as never);
    expect(settings.visibleColumns).toEqual(DEFAULT_COLUMNS.C);
    expect(settings.axisPresentation).toBe('labels');
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
    store.dispatch(resetAll());
    for (const g of ['A', 'B', 'C', 'gold'] as const) {
      expect(selectVisibleColumns(g)(store.getState() as never)).toEqual(DEFAULT_COLUMNS[g]);
      expect(selectAxisPresentation(g)(store.getState() as never)).toBe('labels');
    }
  });
});

describe('localStorage persistence', () => {
  it('persists state to localStorage on dispatch', () => {
    const store = makeStore();
    store.dispatch(setAxisPresentation({ group: 'A', mode: 'tooltip' }));
    const raw = localStorage.getItem('nbp:tableSettings');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.groups.A.axisPresentation).toBe('tooltip');
  });

  it('loads previously saved state from localStorage', () => {
    const saved = {
      groups: {
        A: { visibleColumns: ['code'], axisPresentation: 'combined' },
        B: { visibleColumns: ['code', 'currency', 'mid'], axisPresentation: 'labels' },
        C: { visibleColumns: ['code', 'currency', 'bid', 'ask'], axisPresentation: 'labels' },
        gold: { visibleColumns: ['date', 'price'], axisPresentation: 'labels' },
      },
    };
    localStorage.setItem('nbp:tableSettings', JSON.stringify(saved));
    const store = makeStore();
    expect(selectVisibleColumns('A')(store.getState() as never)).toEqual(['code']);
    expect(selectAxisPresentation('A')(store.getState() as never)).toBe('combined');
  });

  it('falls back to defaults when localStorage is malformed', () => {
    localStorage.setItem('nbp:tableSettings', 'not-json');
    const store = makeStore();
    expect(selectVisibleColumns('A')(store.getState() as never)).toEqual(DEFAULT_COLUMNS.A);
  });
});
