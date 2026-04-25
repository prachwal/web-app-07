/**
 * Logger for API functions.
 *
 * In development (NODE_ENV=development) emits structured logs to the console.
 * In all other environments the logger is a no-op so that no log payload
 * reaches the Vercel production runtime (avoids cold-start overhead).
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMeta {
  [key: string]: unknown;
}

interface Logger {
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta) => void;
  debug: (message: string, meta?: LogMeta) => void;
}

function createNoopLogger(): Logger {
  const noop = () => {};
  return { info: noop, warn: noop, error: noop, debug: noop };
}

function createConsoleLogger(): Logger {
  const fmt = (level: string, message: string, meta?: LogMeta) => {
    const ts = new Date().toISOString().slice(11, 23);
    const metaStr = meta && Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `${ts} [API] ${level}: ${message}${metaStr}`;
  };
  return {
    info: (msg, meta) => console.log(fmt('info', msg, meta)),
    warn: (msg, meta) => console.warn(fmt('warn', msg, meta)),
    error: (msg, meta) => console.error(fmt('error', msg, meta)),
    debug: (msg, meta) => console.debug(fmt('debug', msg, meta)),
  };
}

const _logger: Logger =
  process.env.NODE_ENV === 'development' ? createConsoleLogger() : createNoopLogger();

/**
 * Returns the singleton logger instance.
 */
export function getLogger(): Logger {
  return _logger;
}

/**
 * Logs an error with message and stack trace (dev only).
 */
export function logError(message: string, error?: unknown): void {
  if (process.env.NODE_ENV !== 'development') return;

  if (error instanceof Error) {
    console.error(`[API] ${message}`, { message: error.message, stack: error.stack });
  } else {
    console.error(`[API] ${message}`, { err: String(error) });
  }
}
