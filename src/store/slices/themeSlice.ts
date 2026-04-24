import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Supported color scheme modes. */
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: 'system',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * Sets the active color scheme mode.
     *
     * @param state - Current theme state
     * @param action - Payload containing the new {@link ThemeMode}
     */
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
