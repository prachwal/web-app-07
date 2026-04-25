/**
 * Thin compatibility shim for the legacy `/api/contact` function path.
 * The central Vercel entrypoint now lives in `api/index.ts`.
 */
export { config } from '../index.js';
export { default } from '../index.js';
