import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * Consistent h1 + optional subtitle block shared by About, Contact, Settings.
 */
export function PageHeader({ title, subtitle, className }: PageHeaderProps): React.JSX.Element {
  return (
    <div className={cn('mb-0', className)}>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
