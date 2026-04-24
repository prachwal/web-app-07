import { createBrowserRouter } from 'react-router';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ROUTES } from './routes';

/**
 * Application router created with React Router v7's `createBrowserRouter`.
 * Add new routes by extending the `routes` array.
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
]);
