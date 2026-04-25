import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

import uiPreferencesReducer, {
  setReduceMotion,
  setNotificationsEnabled,
  resetUiPreferences,
} from './uiPreferencesSlice';

function makeStore() {
  return configureStore({ reducer: { uiPreferences: uiPreferencesReducer } });
}

describe('uiPreferencesSlice', () => {
  beforeEach(() => localStorageMock.clear());

  it('has sensible defaults', () => {
    const store = makeStore();
    const state = store.getState().uiPreferences;
    expect(state.reduceMotion).toBe(false);
    expect(state.notificationsEnabled).toBe(true);
  });

  it('setReduceMotion updates and persists', () => {
    const store = makeStore();
    store.dispatch(setReduceMotion(true));
    expect(store.getState().uiPreferences.reduceMotion).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('setNotificationsEnabled updates and persists', () => {
    const store = makeStore();
    store.dispatch(setNotificationsEnabled(false));
    expect(store.getState().uiPreferences.notificationsEnabled).toBe(false);
  });

  it('resetUiPreferences restores defaults', () => {
    const store = makeStore();
    store.dispatch(setReduceMotion(true));
    store.dispatch(resetUiPreferences());
    expect(store.getState().uiPreferences.reduceMotion).toBe(false);
  });
});
