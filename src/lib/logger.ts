/**
 * Development-mode logger.
 * All methods are no-ops in production — no log output is emitted when the build
 * was created in production mode or when `APP_ENV` is not `'development'`.
 *
 * The `APP_ENV` value is injected at build-time from `.env.development` /
 * `.env.production` via the `__APP_CONFIG__` global defined in `vite.config.ts`.
 */

const isDev: boolean =
  typeof __APP_CONFIG__ !== 'undefined'
    ? __APP_CONFIG__.APP_ENV === 'development'
    : import.meta.env.DEV;

/* eslint-disable no-console */
const noop = () => {};

/** Thin wrapper around `console.debug` — no-op in production. */
export const debug = isDev
  ? (...args: unknown[]): void => console.debug('[app:debug]', ...args)
  : noop;

/** Thin wrapper around `console.info` — no-op in production. */
export const info = isDev
  ? (...args: unknown[]): void => console.info('[app:info]', ...args)
  : noop;

/** Thin wrapper around `console.warn` — no-op in production. */
export const warn = isDev
  ? (...args: unknown[]): void => console.warn('[app:warn]', ...args)
  : noop;
/* eslint-enable no-console */
