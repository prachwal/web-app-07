import type { Context } from 'hono';

const helloMessages: Record<'en' | 'pl', string> = {
  en: 'Hello from Vercel API',
  pl: 'Witaj z Vercel API',
};

function parseAcceptLanguage(header: string | undefined | null): 'en' | 'pl' {
  if (!header) return 'en';
  const locale = header.split(',')[0].trim().toLowerCase();
  return locale.startsWith('pl') ? 'pl' : 'en';
}

/**
 * GET /api/hello
 * Returns a localised greeting based on Accept-Language header.
 */
export const helloHandler = async (c: Context) => {
  const language = parseAcceptLanguage(c.req.header('accept-language'));
  const message = helloMessages[language];

  c.header('Content-Language', language);
  return c.json({
    message,
    timestamp: new Date().toISOString(),
  });
};
