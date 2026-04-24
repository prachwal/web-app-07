import { render, type RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { type PropsWithChildren } from 'react';
import '@/i18n';
import themeReducer from '@/store/slices/themeSlice';
import localeReducer from '@/store/slices/localeSlice';
import { baseApi } from '@/store/api/baseApi';

/**
 * Creates a fresh Redux store for testing.
 * Each test gets an isolated store instance to prevent state leakage.
 *
 * @returns A fresh configured store
 */
export function createTestStore() {
  return configureStore({
    reducer: {
      theme: themeReducer,
      locale: localeReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
}

type TestStore = ReturnType<typeof createTestStore>;

interface TestProviderProps extends PropsWithChildren {
  store?: TestStore;
  initialPath?: string;
}

/**
 * Test wrapper that provides Redux store, Router, and i18n context.
 *
 * @param props - Provider props including optional store and initial path
 * @returns Wrapped children with all required providers
 */
function TestProviders({ children, store, initialPath = '/' }: TestProviderProps): React.JSX.Element {
  const testStore = store ?? createTestStore();
  return (
    <Provider store={testStore}>
      <MemoryRouter initialEntries={[initialPath]}>
        {children}
      </MemoryRouter>
    </Provider>
  );
}

/**
 * Custom render function that wraps components with Redux, Router, and i18n.
 * Use this instead of `@testing-library/react`'s `render` in all component tests.
 *
 * @param ui - React element to render
 * @param options - Render options including store and initial path
 * @returns All utilities from @testing-library/react
 *
 * @example
 * ```tsx
 * const { getByRole } = renderWithProviders(<MyComponent />);
 * ```
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    store,
    initialPath,
    ...renderOptions
  }: Omit<RenderOptions, 'wrapper'> & { store?: TestStore; initialPath?: string } = {},
) {
  function Wrapper({ children }: PropsWithChildren): React.JSX.Element {
    return (
      <TestProviders store={store} initialPath={initialPath}>
        {children}
      </TestProviders>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
