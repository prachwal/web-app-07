import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

/**
 * Global UI preferences.
 *
 * NOTE: animateBackdrop / animatePanel / closeOnLink / closeOnEscape
 * were removed — the mobile nav now uses pure CSS transitions and
 * always closes on route change. These flags had no effect after the
 * Header rewrite and were confusing users in Settings.
 */
export interface UiPreferencesState {
  /** Reduce all non-essential animations (respects prefers-reduced-motion). */
  reduceMotion: boolean;
  /** Show/hide the floating notifications area. */
  notificationsEnabled: boolean;
}

const DEFAULT: UiPreferencesState = {
  reduceMotion: false,
  notificationsEnabled: true,
};

const LS_KEY = 'app:uiPreferences';

function load(): UiPreferencesState {
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULT };
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<UiPreferencesState>;
    return {
      reduceMotion: typeof parsed.reduceMotion === 'boolean' ? parsed.reduceMotion : DEFAULT.reduceMotion,
      notificationsEnabled:
        typeof parsed.notificationsEnabled === 'boolean'
          ? parsed.notificationsEnabled
          : DEFAULT.notificationsEnabled,
    };
  } catch {
    return { ...DEFAULT };
  }
}

function persist(state: UiPreferencesState): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

const uiPreferencesSlice = createSlice({
  name: 'uiPreferences',
  initialState: (): UiPreferencesState => load(),
  reducers: {
    setReduceMotion(state, action: PayloadAction<boolean>) {
      state.reduceMotion = action.payload;
      persist(state);
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
      persist(state);
    },
    resetUiPreferences(state) {
      Object.assign(state, DEFAULT);
      persist(state);
    },
  },
});

export const { setReduceMotion, setNotificationsEnabled, resetUiPreferences } =
  uiPreferencesSlice.actions;

export const selectUiPreferences = (state: RootState) => state.uiPreferences;
export const selectReduceMotion = (state: RootState) => state.uiPreferences.reduceMotion;
export const selectNotificationsEnabled = (state: RootState) =>
  state.uiPreferences.notificationsEnabled;

export default uiPreferencesSlice.reducer;
