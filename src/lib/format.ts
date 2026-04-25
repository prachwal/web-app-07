/**
 * Formats a numeric value for chart axis tick labels.
 *
 * Selects decimal precision based on the order of magnitude so ticks are
 * compact but still meaningful across the full range used by NBP data
 * (gold ~400–500 PLN/g, exchange rates ~0.3–10 PLN, minor currencies even smaller).
 *
 * | Value range | Example input | Output  |
 * |-------------|---------------|---------|
 * | ≥ 1 000     | 12 345        | 12.3k   |
 * | 10 – 999.99 | 450.23        | 450.23  |
 * | 1 – 9.99    | 4.2831        | 4.283   |
 * | 0.1 – 0.99  | 0.3241        | 0.3241  |
 * | < 0.1       | 0.0312        | 0.0312  |
 *
 * @param value - The numeric tick value provided by Recharts.
 * @returns Formatted string ready for display as an axis label.
 */
export function formatAxisNumber(value: number): string {
  if (!isFinite(value)) return '';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1000) return `${(value / 1000).toFixed(1)}k`;
  if (abs >= 10) return value.toFixed(2);
  if (abs >= 1) return value.toFixed(3);
  return value.toFixed(4);
}
