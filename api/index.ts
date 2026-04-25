import { type ContactRequest, type ContactResponse } from '../packages/shared/src/contact.js';

export const config = { runtime: 'nodejs' };

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

function json(payload: ContactResponse, status = 200): Response {
  return Response.json(payload, { status });
}

export async function fetchHandler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname !== '/api/contact' && url.pathname !== '/contact') {
    return json({ ok: false, code: 'method_not_allowed', message: 'Method not allowed' }, 405);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return json({ ok: false, code: 'method_not_allowed', message: 'Method not allowed' }, 405);
  }

  const headers = new Headers({
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return Response.json(
      {
        ok: false,
        code: 'rate_limited',
        message: 'Too many requests, please wait a moment',
      } satisfies ContactResponse,
      { status: 429, headers },
    );
  }

  const body = await request.json().catch(() => null);
  const { ok, fieldErrors } = validate(body);
  if (!ok) {
    return Response.json(
      {
        ok: false,
        code: 'validation_error',
        message: 'Validation failed',
        fieldErrors,
      } satisfies ContactResponse,
      { status: 400, headers },
    );
  }

  try {
    const data = body as ContactRequest;
    const id = await submitMessage(data);
    return Response.json(
      {
        ok: true,
        id,
        receivedAt: new Date().toISOString(),
      } satisfies ContactResponse,
      { status: 200, headers },
    );
  } catch (error) {
    console.error('[contact] unexpected error', error);
    return Response.json(
      {
        ok: false,
        code: 'internal_error',
        message: 'An unexpected error occurred',
      } satisfies ContactResponse,
      { status: 500, headers },
    );
  }
}

export default { fetch: fetchHandler };
