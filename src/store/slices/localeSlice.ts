import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Supported application locales. */
export type Locale = 'en' | 'pl';

interface LocaleState {
  locale: Locale;
}

const initialState: LocaleState = {
  locale: 'en',
};

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    /**
     * Sets the active application locale.
     *
     * @param state - Current locale state
     * @param action - Payload containing the new {@link Locale}
     */
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
  },
});

export const { setLocale } = localeSlice.actions;
export default localeSlice.reducer;
