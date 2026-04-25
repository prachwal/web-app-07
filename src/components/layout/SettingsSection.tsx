import { cn } from '@/lib/utils';

export interface SettingsSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Labelled settings section with aria-labelledby heading.
 * Eliminates repetitive section/h2/p pattern in SettingsPage.
 */
export function SettingsSection({
  id,
  title,
  description,
  children,
  className,
}: SettingsSectionProps): React.JSX.Element {
  return (
    <section aria-labelledby={id} className={cn('mt-10', className)}>
      <h2 id={id} className="text-xl font-semibold text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}
