import { cn } from '@/lib/utils';

export interface CurrencyNameProps {
  name: string;
  className?: string;
  mobileMaxWidth?: string;
}

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
