/**
 * @file src/components/contact/ContactFormField.tsx
 * Extends the generic FormField with an optional character counter.
 */

import { cn } from '@/lib/utils';

export interface ContactFormFieldProps {
  id: string;
  label: string;
  error?: string;
  /** Current character count (from watched field value). */
  charCount?: number;
  /** Maximum allowed characters — shown in counter when provided. */
  maxChars?: number;
  children: React.ReactNode;
}

export function ContactFormField({
  id,
  label,
  error,
  charCount,
  maxChars,
  children,
}: ContactFormFieldProps): React.JSX.Element {
  const errorId = error ? `${id}-error` : undefined;
  const nearLimit = maxChars !== undefined && charCount !== undefined && charCount > maxChars * 0.85;
  const atLimit   = maxChars !== undefined && charCount !== undefined && charCount >= maxChars;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {maxChars !== undefined && charCount !== undefined && (
          <span
            aria-live="polite"
            className={cn(
              'text-xs tabular-nums transition-colors',
              atLimit   ? 'font-semibold text-destructive' :
              nearLimit ? 'text-amber-500' :
                          'text-muted-foreground',
            )}
          >
            {charCount}/{maxChars}
          </span>
        )}
      </div>

      {children}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
