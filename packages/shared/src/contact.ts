/**
 * @file packages/shared/src/contact.ts
 * Shared request/response types for the /api/contact endpoint.
 * Imported by both the frontend service and the Vercel serverless function.
 */

// ─── Request ──────────────────────────────────────────────────────────────────

/** Fields submitted by the contact form. */
export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** ISO 8601 timestamp set by the client. */
  sentAt: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

/** Successful response payload. */
export interface ContactSuccessResponse {
  ok: true;
  /** Opaque reference ID for the submitted message. */
  id: string;
  /** ISO 8601 timestamp when the server accepted the message. */
  receivedAt: string;
}

/** Error response payload returned with 4xx / 5xx status codes. */
export interface ContactErrorResponse {
  ok: false;
  /** Machine-readable error code. */
  code: ContactErrorCode;
  /** Human-readable description (English). */
  message: string;
  /** Field-level validation errors, present when code is 'validation_error'. */
  fieldErrors?: Partial<Record<keyof ContactRequest, string>>;
}

export type ContactResponse = ContactSuccessResponse | ContactErrorResponse;

// ─── Error codes ──────────────────────────────────────────────────────────────

export type ContactErrorCode =
  | 'validation_error'   // 400 — one or more fields failed validation
  | 'rate_limited'       // 429 — too many requests from this IP
  | 'method_not_allowed' // 405 — wrong HTTP method
  | 'internal_error';    // 500 — unexpected server error

// ─── Validation constants (shared, so frontend and API stay in sync) ──────────

export const CONTACT_LIMITS = {
  name:    { min: 2,  max: 100 },
  email:   { max: 254 },
  subject: { min: 3,  max: 200 },
  message: { min: 10, max: 5000 },
} as const;
