/**
 * SVG color constants for Recharts chart components.
 *
 * Recharts SVG presentation attributes (`stroke`, `fill`, etc.) do not support
 * CSS custom properties at runtime. These constants mirror the design tokens
 * defined in `src/styles/globals.css` so all color values remain centralized
 * in the Tailwind/CSS layer — no hex literals appear in component files.
 *
 * Theme-adaptive colors (axis, grid) have separate light / dark variants that
 * must be chosen at render time using `useIsDark()`.
 * Static line colors do not change with the theme.
 *
 * Keep this file in sync with `globals.css` `@theme` and `.dark` sections.
 */

/* ── theme-adaptive (match --color-muted-foreground and --color-border) ── */

/** Axis tick / label color for light mode — matches `--color-muted-foreground` light. */
export const CHART_AXIS_LIGHT = 'oklch(0.556 0 0)';
/** Axis tick / label color for dark mode — matches `--color-muted-foreground` dark. */
export const CHART_AXIS_DARK  = 'oklch(0.708 0 0)';

/** Cartesian grid line color for light mode — matches `--color-border` light. */
export const CHART_GRID_LIGHT = 'oklch(0.922 0 0)';
/** Cartesian grid line color for dark mode — matches `--color-border` dark. */
export const CHART_GRID_DARK  = 'oklch(1 0 0 / 10%)';

/* Tooltip background / border / text — matches popover tokens */
/** Tooltip background for light mode — matches `--color-popover` light. */
export const CHART_TOOLTIP_BG_LIGHT     = 'oklch(1 0 0)';
/** Tooltip background for dark mode — matches `--color-popover` dark. */
export const CHART_TOOLTIP_BG_DARK      = 'oklch(0.205 0 0)';
/** Tooltip text for light mode — matches `--color-popover-foreground` light. */
export const CHART_TOOLTIP_TEXT_LIGHT   = 'oklch(0.145 0 0)';
/** Tooltip text for dark mode — matches `--color-popover-foreground` dark. */
export const CHART_TOOLTIP_TEXT_DARK    = 'oklch(0.985 0 0)';

/* ── static line colors (same in both themes) ── */

/** Mid-rate line color — matches `--color-chart-mid` (blue-500). */
export const CHART_COLOR_MID       = 'oklch(0.623 0.214 259.815)';
/** Bid (buy) line color — matches `--color-chart-bid` (green-500). */
export const CHART_COLOR_BID       = 'oklch(0.627 0.194 149.214)';
/** Ask (sell) line color — matches `--color-chart-ask` (red-500). */
export const CHART_COLOR_ASK       = 'oklch(0.637 0.237 25.331)';
/** Gold price line color — matches `--color-chart-gold-line` (amber-500). */
export const CHART_COLOR_GOLD_LINE = 'oklch(0.769 0.188 70.08)';
