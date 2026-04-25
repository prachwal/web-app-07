import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

/** Global UI preferences affecting navigation and motion behavior. */
export interface UiPreferencesState {
  animateBackdrop: boolean;
  animatePanel: boolean;
  closeOnLink: boolean;
  closeOnEscape: boolean;
}

/** Default UI preferences preserve the current mobile drawer behavior. */
export const DEFAULT_UI_PREFERENCES: UiPreferencesState = {
  animateBackdrop: true,
  animatePanel: true,
  closeOnLink: true,
  closeOnEscape: true,
};

const LS_KEY = 'app:uiPreferences';

function buildDefaultState(): UiPreferencesState {
  return { ...DEFAULT_UI_PREFERENCES };
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Read persisted preferences from localStorage, falling back to defaults. */
function loadFromStorage(): UiPreferencesState {
  const defaults = buildDefaultState();

  try {
    if (typeof localStorage === 'undefined') {
      return defaults;
    }

    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaults;

    const parsed = JSON.parse(raw) as Partial<UiPreferencesState>;
    return {
      animateBackdrop: readBoolean(parsed.animateBackdrop, defaults.animateBackdrop),
      animatePanel: readBoolean(parsed.animatePanel, defaults.animatePanel),
      closeOnLink: readBoolean(parsed.closeOnLink, defaults.closeOnLink),
      closeOnEscape: readBoolean(parsed.closeOnEscape, defaults.closeOnEscape),
    };
  } catch {
    return defaults;
  }
}

/** Persist current preferences to localStorage. */
function persist(state: UiPreferencesState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or private-mode failures.
  }
}

/**
 * Redux slice for global UI preferences.
 * Settings are persisted to localStorage on every change.
 */
const uiPreferencesSlice = createSlice({
  name: 'uiPreferences',
  initialState: (): UiPreferencesState => loadFromStorage(),
  reducers: {
    setAnimateBackdrop(state, action: PayloadAction<boolean>) {
      state.animateBackdrop = action.payload;
      persist(state);
    },
    setAnimatePanel(state, action: PayloadAction<boolean>) {
      state.animatePanel = action.payload;
      persist(state);
    },
    setCloseOnLink(state, action: PayloadAction<boolean>) {
      state.closeOnLink = action.payload;
      persist(state);
    },
    setCloseOnEscape(state, action: PayloadAction<boolean>) {
      state.closeOnEscape = action.payload;
      persist(state);
    },
    resetUiPreferences(state) {
      Object.assign(state, buildDefaultState());
      persist(state);
    },
  },
});

export const {
  setAnimateBackdrop,
  setAnimatePanel,
  setCloseOnLink,
  setCloseOnEscape,
  resetUiPreferences,
} = uiPreferencesSlice.actions;

export const selectUiPreferences = (state: RootState) => state.uiPreferences;
export const selectAnimateBackdrop = (state: RootState) => state.uiPreferences.animateBackdrop;
export const selectAnimatePanel = (state: RootState) => state.uiPreferences.animatePanel;
export const selectCloseOnLink = (state: RootState) => state.uiPreferences.closeOnLink;
export const selectCloseOnEscape = (state: RootState) => state.uiPreferences.closeOnEscape;

export default uiPreferencesSlice.reducer;
