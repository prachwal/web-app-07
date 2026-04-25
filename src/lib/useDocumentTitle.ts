import { useEffect } from 'react';

const BASE_TITLE = 'Kursy walut NBP';

/**
 * Sets the document title dynamically.
 * Appends " | Kursy walut NBP" as suffix for sub-pages.
 * @param segment - page-specific title segment, or empty for the base title
 */
export function useDocumentTitle(segment?: string): void {
  useEffect(() => {
    document.title = segment ? `${segment} | ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [segment]);
}
