import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { NbpRate } from '@/store/api/nbpApi';

export interface NbpSelection {
  code: string;
  currency: string;
  mid?: number;
}

export function NbpDetails({ selection }: { selection?: NbpSelection | null }): React.JSX.Element | null {
  const { t } = useTranslation('nbp');
  if (!selection) return null;
  return (
    <div className={cn('rounded-md border border-border p-4')}>
      <p className="text-sm font-medium text-foreground">{selection.code}</p>
      <p className="text-xs text-muted-foreground">{selection.currency}</p>
      {selection.mid != null && <p className="mt-2 text-sm tabular-nums">{selection.mid.toFixed(4)}</p>}
    </div>
  );
}

export type { NbpSelection };
