import { Hono } from 'hono';
import { helloHandler } from './handlers/hello.js';
import { healthHandler } from './handlers/health.js';
import { contactRoute } from './handlers/contact.js';

export const config = { runtime: 'nodejs' };

// basePath('/api') so routes match the incoming URL /api/hello, /api/health, /api/contact
export const app = new Hono().basePath('/api');

app.onError((err, c) => {
  if (err instanceof Error) {
    console.error('[API] Hono error:', err.message);
    console.error(err.stack);
  } else {
    console.error('[API] Hono error:', err);
  }
  return c.json({ ok: false, message: err instanceof Error ? err.message : 'Internal error' }, 500);
});

app.get('/hello', helloHandler);
app.get('/health', healthHandler);
app.route('/contact', contactRoute);

// Named `fetch` export — @vercel/node v5 resolves via
// `typeof listener.fetch === "function"` on the raw module object,
// which is checked BEFORE the default-unwrapping loop runs.
export const fetch = (request: Request) => app.fetch(request);
