import { useMemo } from 'react';

/**
 * Returns a stable-sorted copy of `items` with favourite codes first.
 * Non-favourite items retain their original order.
 *
 * @param items     - Array of items that have a `code` string field
 * @param favorites - Array of favourite currency codes
 */
export function useFavoriteSorter<T extends { code: string }>(
  items: T[],
  favorites: string[],
): T[] {
  return useMemo(
    () =>
      [...items].sort((a, b) => {
        const aFav = favorites.includes(a.code) ? 0 : 1;
        const bFav = favorites.includes(b.code) ? 0 : 1;
        return aFav - bFav;
      }),
    [items, favorites],
  );
}
