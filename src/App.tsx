import { RouterProvider } from 'react-router';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import { router } from '@/routes';

/**
 * Root application component.
 * Mounts side-effect providers (theme, i18n) and the router.
 *
 * @returns The root application element
 */
export function App(): React.JSX.Element {
  return (
    <>
      <ThemeProvider />
      <I18nProvider />
      <RouterProvider router={router} />
    </>
  );
}
