/** Application route path constants. */
export const ROUTES = {
  HOME: '/',
  NOT_FOUND: '*',
} as const;

/** Union type of all route paths. */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
