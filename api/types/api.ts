/**
 * Standard API response envelope — ported from web-app-03.
 */
export interface ErrorObject {
  code?: string | number;
  message: string;
  details?: Record<string, unknown>;
}

export interface MetadataObject {
  requestId?: string;
  path?: string;
  service?: string;
  generatedAt?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  status: boolean;
  payload: T;
  error?: ErrorObject;
  metadata?: MetadataObject;
}

/**
 * Payload types
 */
export interface HelloPayload {
  message: string;
  timestamp: string;
}

export interface HealthStat {
  name: string;
  value: string;
}

export interface HealthPayload {
  status: 'ok';
  timestamp: string;
  stats: HealthStat[];
}
