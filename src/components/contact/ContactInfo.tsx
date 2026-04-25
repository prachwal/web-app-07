/**
 * @file src/components/contact/ContactInfo.tsx
 * Static contact information panel shown beside the form.
 */

import { Mail, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center',
        'rounded-lg bg-primary/10 text-primary',
      )}>
        <Icon size={16} aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ContactInfo(): React.JSX.Element {
  const { t } = useTranslation('contact');

  return (
    <aside className="flex flex-col gap-6 rounded-2xl border border-border bg-muted/30 p-6">
      <h2 className="text-base font-semibold text-foreground">{t('info.heading')}</h2>
      <div className="flex flex-col gap-5">
        <InfoItem icon={Mail}  label={t('info.emailLabel')} value={t('info.email')} />
        <InfoItem icon={MapPin} label={t('info.locationLabel')} value={t('info.location')} />
        <InfoItem icon={Clock} label={t('info.hoursLabel')} value={t('info.hours')} />
      </div>
    </aside>
  );
}
