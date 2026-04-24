import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Base RTK Query API slice.
 * Feature-specific API slices should inject endpoints into this base.
 *
 * @example
 * ```ts
 * const postsApi = baseApi.injectEndpoints({ endpoints: (build) => ({...}) });
 * ```
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: () => ({}),
});
