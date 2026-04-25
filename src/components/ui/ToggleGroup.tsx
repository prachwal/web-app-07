import { cn } from '@/lib/utils';

export interface ToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/**
 * Accessible group of toggle (radio-like) buttons.
 * Replaces duplicate theme / locale button groups in SettingsPage and Header.
 */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: ToggleGroupProps<T>): React.JSX.Element {
  return (
    <div className="flex gap-2" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          aria-label={option.label}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors',
            value === option.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:text-foreground',
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
