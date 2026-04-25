import { Hono } from 'hono';
import { type ContactRequest, type ContactResponse } from '../../packages/shared/src/contact.js';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(ip, entry);
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

interface ValidationResult {
  ok: boolean;
  fieldErrors: Partial<Record<keyof ContactRequest, string>>;
}

function validate(body: unknown): ValidationResult {
  const errors: Partial<Record<keyof ContactRequest, string>> = {};

  if (typeof body !== 'object' || body === null) {
    return { ok: false, fieldErrors: { name: 'Invalid request body' } };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.name !== 'string' || b.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (b.name.trim().length > 100) {
    errors.name = 'Name must be at most 100 characters';
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof b.email !== 'string' || !emailRe.test(b.email)) {
    errors.email = 'Please provide a valid email address';
  } else if (b.email.length > 254) {
    errors.email = 'Email must be at most 254 characters';
  }

  if (typeof b.subject !== 'string' || b.subject.trim().length < 3) {
    errors.subject = 'Subject must be at least 3 characters';
  } else if (b.subject.trim().length > 200) {
    errors.subject = 'Subject must be at most 200 characters';
  }

  if (typeof b.message !== 'string' || b.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  } else if (b.message.trim().length > 5000) {
    errors.message = 'Message must be at most 5000 characters';
  }

  return { ok: Object.keys(errors).length === 0, fieldErrors: errors };
}

async function submitMessage(data: ContactRequest): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 80));

  const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  console.log('[contact] message accepted', {
    id,
    name: data.name,
    email: data.email,
    subject: data.subject,
  });
  return id;
}

export const contactRoute = new Hono();

contactRoute.options('/', (c) => {
  c.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN ?? '*');
  c.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
  return c.body(null, 204);
});

contactRoute.post('/', async (c) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN ?? '*';
  c.header('Access-Control-Allow-Origin', allowedOrigin);
  c.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');

  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return c.json(
      {
        ok: false,
        code: 'rate_limited',
        message: 'Too many requests, please wait a moment',
      } satisfies ContactResponse,
      429,
    );
  }

  const body = (await c.req.json().catch(() => null)) as unknown;
  const { ok, fieldErrors } = validate(body);
  if (!ok) {
    return c.json(
      {
        ok: false,
        code: 'validation_error',
        message: 'Validation failed',
        fieldErrors,
      } satisfies ContactResponse,
      400,
    );
  }

  try {
    const data = body as ContactRequest;
    const id = await submitMessage(data);
    return c.json(
      {
        ok: true,
        id,
        receivedAt: new Date().toISOString(),
      } satisfies ContactResponse,
      200,
    );
  } catch (error) {
    console.error('[contact] unexpected error', error);
    return c.json(
      {
        ok: false,
        code: 'internal_error',
        message: 'An unexpected error occurred',
      } satisfies ContactResponse,
      500,
    );
  }
});
