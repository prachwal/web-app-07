import { useMemo } from 'react';

export interface UsePaginationResult<T> {
  pageItems: T[];
  safePage: number;
  totalPages: number;
}

/**
 * Slices an array into a single page of items.
 * Clamps `page` to valid bounds automatically.
 *
 * @param items - Full sorted list of items
 * @param page  - Requested 1-based page number
 * @param pageSize - Items per page
 */
export function usePagination<T>(
  items: T[],
  page: number,
  pageSize: number,
): UsePaginationResult<T> {
  return useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const offset = (safePage - 1) * pageSize;
    return {
      pageItems: items.slice(offset, offset + pageSize),
      safePage,
      totalPages,
    };
  }, [items, page, pageSize]);
}
