import { cn } from '@/lib/utils';

export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactElement<{
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  }>;
}

/**
 * Accessible form field wrapper: label → input/textarea → error message.
 * Automatically wires aria-invalid and aria-describedby to the child input.
 */
export function FormField({ id, label, error, children }: FormFieldProps): React.JSX.Element {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {/* Clone child to inject a11y props without breaking ref forwarding */}
      {children}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/** Shared input className for all text inputs in forms. */
export const inputClass = cn(
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
  'placeholder:text-muted-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
);

/** Submit button with loading state. */
export interface SubmitButtonProps {
  isSubmitting: boolean;
  label: string;
  loadingLabel: string;
}

export function SubmitButton({ isSubmitting, label, loadingLabel }: SubmitButtonProps): React.JSX.Element {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        'rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground',
        'hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'disabled:cursor-not-allowed disabled:opacity-50 transition-opacity',
      )}
    >
      {isSubmitting ? loadingLabel : label}
    </button>
  );
}
