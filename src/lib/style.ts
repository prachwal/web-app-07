/**
 * Reads a CSS custom property value from the document root element.
 *
 * Safe to call during render — returns the fallback value in non-browser
 * environments (SSR / test) or when the property is not defined.
 *
 * @param name - CSS variable name including the leading `--` prefix.
 * @param fallback - Value returned when the property cannot be resolved.
 * @returns The trimmed computed value, or the fallback string.
 *
 * @example
 * ```ts
 * // Read a theme-adaptive color from globals.css @theme vars
 * const axisColor = getCssVar('--color-muted-foreground', 'currentColor');
 * ```
 */
export function getCssVar(name: string, fallback = ''): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
