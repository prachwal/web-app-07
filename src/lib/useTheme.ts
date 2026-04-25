import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';

/**
 * Returns `true` when the effective color scheme is dark.
 * Subscribes to both the Redux `themeSlice` and the system
 * `prefers-color-scheme` media query so the result is always
 * in sync with what `ThemeProvider` applies to `<html>`.
 */
export function useIsDark(): boolean {
  const mode = useAppSelector((state) => state.theme.mode);

  const [systemIsDark, setSystemIsDark] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return systemIsDark;
}
