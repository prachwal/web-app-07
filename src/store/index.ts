import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import themeReducer from './slices/themeSlice';
import localeReducer from './slices/localeSlice';
import notificationsReducer from './slices/notificationsSlice';
import tableSettingsReducer from './slices/tableSettingsSlice';
import uiPreferencesReducer from './slices/uiPreferencesSlice';
import { baseApi } from './api/baseApi';
import { nbpApi } from './api/nbpApi';

/**
 * The application Redux store.
 * Includes theme, locale, UI preference slices and the RTK Query API middleware.
 */
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    locale: localeReducer,
    notifications: notificationsReducer,
    tableSettings: tableSettingsReducer,
    uiPreferences: uiPreferencesReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [nbpApi.reducerPath]: nbpApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, nbpApi.middleware),
});

/** Inferred root state type from the store. */
export type RootState = ReturnType<typeof store.getState>;

/** Inferred dispatch type from the store. */
export type AppDispatch = typeof store.dispatch;

/**
 * Typed `useDispatch` hook for this application's store.
 * Prefer this over plain `useDispatch` for full type inference.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed `useSelector` hook for this application's store.
 * Prefer this over plain `useSelector` for full type inference.
 *
 * @param selector - Selector function receiving {@link RootState}
 */
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);
