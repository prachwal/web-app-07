import { useState, useEffect } from 'react';

const MOBILE_MQ = '(max-width: 1023px)';

/**
 * Returns `true` when the viewport is narrower than the `lg` breakpoint (< 1024 px).
 * Updates reactively on viewport resize via `matchMedia`.
 *
 * Used to choose between the inline side-panel (desktop) and the bottom-sheet
 * drawer (mobile) in data views.
 *
 * @returns `true` on mobile / tablet viewports, `false` on large-screen viewports.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
