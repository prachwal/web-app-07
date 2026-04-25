import { cn } from '@/lib/utils';

/** Props for the {@link CurrencyName} component. */
export interface CurrencyNameProps {
  /** Full currency name, shown as tooltip and truncated in the cell. */
  name: string;
  /** Additional class names forwarded to the outer `<span>`. */
  className?: string;
  /** Maximum width before the text truncates on small viewports (Tailwind class). Defaults to `max-w-[120px]`. */
  mobileMaxWidth?: string;
}

/**
 * Renders a currency name cell that:
 * – truncates long names on mobile with an ellipsis
 * – shows the full name on hover / focus via the native `title` attribute
 * – expands to full width on `sm` and wider screens
 *
 * Reusable across NbpGrid (tabs A/B and C rows) to avoid duplicated markup.
 *
 * @param props - {@link CurrencyNameProps}
 * @returns A `<span>` element with truncation and tooltip
 */
export function CurrencyName({
  name,
  className,
  mobileMaxWidth = 'max-w-[120px]',
}: CurrencyNameProps): React.JSX.Element {
  return (
    <span
      className={cn('block truncate sm:max-w-none', mobileMaxWidth, className)}
      title={name}
    >
      {name}
    </span>
  );
}
