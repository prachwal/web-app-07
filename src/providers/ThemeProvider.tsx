import { useEffect } from 'react';
import { useAppSelector } from '@/store';

/**
 * Synchronizes the Redux theme state with the DOM.
 * Applies or removes the `.dark` class on `<html>` based on the current mode.
 * For `system` mode, listens to `prefers-color-scheme` media query changes.
 *
 * @returns null — renders nothing, only handles side effects
 */
export function ThemeProvider(): null {
  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (effectiveMode: 'light' | 'dark') => {
      if (effectiveMode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) =>
        applyTheme(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }

    applyTheme(mode);
  }, [mode]);

  return null;
}
