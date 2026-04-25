import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

// Must mock localStorage before any module that reads it during import/init
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

import uiPreferencesReducer, {
  DEFAULT_UI_PREFERENCES,
  resetUiPreferences,
  selectUiPreferences,
  setAnimateBackdrop,
  setAnimatePanel,
  setCloseOnLink,
  setCloseOnEscape,
} from './uiPreferencesSlice';

const makeStore = (preloadedState?: Parameters<typeof configureStore>[0]['preloadedState']) =>
  configureStore({
    reducer: { uiPreferences: uiPreferencesReducer },
    preloadedState,
  });

beforeEach(() => {
  localStorageMock.clear();
  vi.restoreAllMocks();
});

describe('uiPreferencesSlice – initial state', () => {
  it('starts with the default preferences', () => {
    const store = makeStore();
    expect(selectUiPreferences(store.getState() as never)).toEqual(DEFAULT_UI_PREFERENCES);
  });
});

describe('uiPreferencesSlice – persistence', () => {
  it('persists state to localStorage on dispatch', () => {
    const store = makeStore();
    store.dispatch(setAnimateBackdrop(false));

    const raw = localStorage.getItem('app:uiPreferences');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw as string)).toMatchObject({
      animateBackdrop: false,
      animatePanel: true,
      closeOnLink: true,
      closeOnEscape: true,
    });
  });

  it('loads previously saved state from localStorage', () => {
    const saved = {
      animateBackdrop: false,
      animatePanel: false,
      closeOnLink: false,
      closeOnEscape: true,
    };

    localStorage.setItem('app:uiPreferences', JSON.stringify(saved));

    const store = makeStore();
    expect(selectUiPreferences(store.getState() as never)).toEqual(saved);
  });

  it('falls back to defaults when localStorage is malformed', () => {
    localStorage.setItem('app:uiPreferences', 'not-json');

    const store = makeStore();
    expect(selectUiPreferences(store.getState() as never)).toEqual(DEFAULT_UI_PREFERENCES);
  });
});

describe('uiPreferencesSlice – actions', () => {
  it('updates individual flags', () => {
    const store = makeStore();
    store.dispatch(setAnimateBackdrop(false));
    store.dispatch(setAnimatePanel(false));
    store.dispatch(setCloseOnLink(false));
    store.dispatch(setCloseOnEscape(false));
    expect(selectUiPreferences(store.getState() as never)).toEqual({
      animateBackdrop: false,
      animatePanel: false,
      closeOnLink: false,
      closeOnEscape: false,
    });
  });

  it('resets to defaults', () => {
    const store = makeStore();
    store.dispatch(setAnimateBackdrop(false));
    store.dispatch(setAnimatePanel(false));
    store.dispatch(setCloseOnLink(false));
    store.dispatch(setCloseOnEscape(false));
    store.dispatch(resetUiPreferences());
    expect(selectUiPreferences(store.getState() as never)).toEqual(DEFAULT_UI_PREFERENCES);
  });
});
