import type { Context } from 'hono';
import type { HelloPayload } from '../types/api.js';
import { createEnvelope, createErrorEnvelope } from '../_lib/utils.js';
import { getLogger, logError } from '../_lib/logger.js';

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
export const helloHandler = (c: Context) => {
  try {
    const logger = getLogger();
    logger.info('GET /api/hello');

    const language = parseAcceptLanguage(c.req.header('accept-language'));
    const payload: HelloPayload = {
      message: helloMessages[language],
      timestamp: new Date().toISOString(),
    };

    logger.debug('hello response built', { language });
    c.header('Content-Language', language);
    return c.json(createEnvelope(payload, '/api/hello'));
  } catch (err) {
    logError('helloHandler failed', err);
    return c.json(createErrorEnvelope('Internal server error', '/api/hello'), 500);
  }
};
