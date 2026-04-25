/**
 * @file src/services/contact/contactService.ts
 *
 * Frontend service for submitting the contact form to /api/contact.
 * Keeps all fetch logic, error normalisation, and env-awareness in one place.
 */

import type {
  ContactRequest,
  ContactResponse,
  ContactErrorCode,
} from '@shared/contact';

// ─── Service error ─────────────────────────────────────────────────────────────

export class ContactServiceError extends Error {
  constructor(
    public readonly code: ContactErrorCode,
    message: string,
    public readonly fieldErrors?: Partial<Record<keyof ContactRequest, string>>,
  ) {
    super(message);
    this.name = 'ContactServiceError';
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

/** Base URL for the API — empty string means same-origin (works on Vercel). */
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

/** Endpoint path. */
const ENDPOINT = `${API_BASE}/api/contact`;

/** Request timeout in milliseconds. */
const TIMEOUT_MS = 10_000;

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Submit contact form data to the serverless API.
 *
 * @param data - Validated form values (name, email, subject, message)
 * @returns The success response payload
 * @throws {ContactServiceError} on validation errors, rate limiting, or network failures
 */
export async function submitContactForm(
  data: Omit<ContactRequest, 'sentAt'>,
): Promise<{ id: string; receivedAt: string }> {
  const payload: ContactRequest = {
    ...data,
    sentAt: new Date().toISOString(),
  };

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ContactServiceError('internal_error', 'Request timed out. Please try again.');
    }
    throw new ContactServiceError('internal_error', 'Network error. Please check your connection.');
  } finally {
    window.clearTimeout(timeoutId);
  }

  let json: ContactResponse;
  try {
    json = (await res.json()) as ContactResponse;
  } catch {
    throw new ContactServiceError('internal_error', 'Unexpected server response.');
  }

  if (json.ok) {
    return { id: json.id, receivedAt: json.receivedAt };
  }

  throw new ContactServiceError(json.code, json.message, json.fieldErrors);
}
