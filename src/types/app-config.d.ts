/**
 * Type declaration for the `__APP_CONFIG__` global injected by Vite
 * at build-time via the `define` option in `vite.config.ts`.
 *
 * Values are sourced from `.env.development` / `.env.production`
 * (any key prefixed with `VITE_` minus the prefix).
 */
declare const __APP_CONFIG__: {
  /** Deployment environment — `'development'` | `'production'` | custom string. */
  readonly APP_ENV: string;
};
