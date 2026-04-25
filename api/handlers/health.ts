import type { Context } from 'hono';
import type { HealthPayload } from '../types/api.js';
import { createEnvelope, createErrorEnvelope } from '../_lib/utils.js';
import { getLogger, logError } from '../_lib/logger.js';

const createHealthPayload = (): HealthPayload => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  stats: [
    { name: 'uptime', value: `${process.uptime().toFixed(2)}s` },
    { name: 'memoryRss', value: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB` },
    { name: 'nodeVersion', value: process.version },
    { name: 'platform', value: process.platform },
  ],
});

/**
 * GET /api/health
 * Returns process stats and runtime status.
 */
export const healthHandler = (c: Context) => {
  try {
    const logger = getLogger();
    logger.info('GET /api/health');
    const payload = createHealthPayload();
    logger.debug('health payload ready', { uptime: payload.stats[0].value });
    return c.json(createEnvelope(payload, '/api/health'));
  } catch (err) {
    logError('healthHandler failed', err);
    return c.json(createErrorEnvelope('Internal server error', '/api/health'), 500);
  }
};
