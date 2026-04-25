import { Hono } from 'hono';
import { helloHandler } from './handlers/hello.js';
import { contactRoute } from './handlers/contact.js';

export const config = { runtime: 'nodejs' };

// basePath('/api') so routes match the incoming URL /api/hello, /api/contact
const app = new Hono().basePath('/api');

app.onError((err, c) => {
  console.error('[API] Hono error:', err instanceof Error ? err.message : err);
  return c.json({ ok: false, message: err instanceof Error ? err.message : 'Internal error' }, 500);
});

app.get('/hello', helloHandler);
app.route('/contact', contactRoute);

// Named `fetch` export — @vercel/node v5 resolves via
// `typeof listener.fetch === "function"` on the raw module object,
// which is checked BEFORE the default-unwrapping loop runs.
export const fetch = (request: Request) => app.fetch(request);
