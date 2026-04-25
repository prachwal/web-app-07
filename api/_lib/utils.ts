import type { ApiResponse } from '../types/api.js';

/**
 * Wraps a successful payload in the standard ApiResponse envelope.
 */
export const createEnvelope = <T>(payload: T, path: string): ApiResponse<T> => ({
  status: true,
  payload,
  metadata: {
    path,
    generatedAt: new Date().toISOString(),
  },
});

/**
 * Wraps an error message in the standard ApiResponse envelope.
 */
export const createErrorEnvelope = (message: string, path: string): ApiResponse<null> => ({
  status: false,
  payload: null,
  error: { message },
  metadata: {
    path,
    generatedAt: new Date().toISOString(),
  },
});
