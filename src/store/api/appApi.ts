import { baseApi } from './baseApi';

/** Standard API response envelope from the Vercel API functions. */
export interface AppApiResponse<T> {
  status: boolean;
  payload: T;
  metadata?: {
    path?: string;
    generatedAt?: string;
  };
}

/** Payload returned by GET /api/hello. */
export interface HelloPayload {
  message: string;
  timestamp: string;
}

/** Single process stat entry returned by GET /api/health. */
export interface HealthStat {
  name: string;
  value: string;
}

/** Payload returned by GET /api/health. */
export interface HealthPayload {
  status: 'ok';
  timestamp: string;
  stats: HealthStat[];
}

/**
 * RTK Query endpoints for the app's own Vercel API functions.
 * Injected into the shared `baseApi` slice (reducerPath: 'api', baseUrl: '/api').
 */
export const appApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getHello: build.query<AppApiResponse<HelloPayload>, void>({
      query: () => '/hello',
    }),
    getHealth: build.query<AppApiResponse<HealthPayload>, void>({
      query: () => '/health',
    }),
  }),
});

export const { useGetHelloQuery, useGetHealthQuery } = appApi;
