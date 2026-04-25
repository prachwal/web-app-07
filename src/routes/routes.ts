/** Application route path constants. */
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
} as const;

/** Union type of all route paths. */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
