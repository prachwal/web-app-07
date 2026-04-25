import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { PageLoader } from '@/components/layout/PageLoader';
import { ErrorPage } from '@/pages/ErrorPage';
import { ROUTES } from './routes';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() =>
  import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

const wrap = (el: React.ReactElement) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

/**
 * Application router with lazy-loaded pages, Suspense fallback, and per-route error boundaries.
 */
export const router = createBrowserRouter([
  { path: ROUTES.HOME, element: wrap(<HomePage />), errorElement: <ErrorPage /> },
  { path: ROUTES.ABOUT, element: wrap(<AboutPage />), errorElement: <ErrorPage /> },
  { path: ROUTES.CONTACT, element: wrap(<ContactPage />), errorElement: <ErrorPage /> },
  { path: ROUTES.SETTINGS, element: wrap(<SettingsPage />), errorElement: <ErrorPage /> },
  { path: ROUTES.NOT_FOUND, element: wrap(<NotFoundPage />), errorElement: <ErrorPage /> },
]);
