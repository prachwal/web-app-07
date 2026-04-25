import { useTranslation } from 'react-i18next';
import { MessageSquare, Server, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { useGetHelloQuery, useGetHealthQuery } from '@/store/api/appApi';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton(): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Skeleton className="mb-3 h-10 w-10 rounded-lg" />
      <Skeleton className="mb-1 h-4 w-28" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onRetry?: () => unknown;
  retryLabel?: string;
  error?: boolean;
}

function StatusCard({
  icon,
  title,
  children,
  onRetry,
  retryLabel,
  error,
}: StatusCardProps): React.JSX.Element {
  return (
    <article
      className={cn(
        'rounded-xl border bg-card p-6 transition-shadow hover:shadow-md',
        error && 'border-destructive/30 bg-destructive/5',
      )}
    >
      <div
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <div className="text-sm text-muted-foreground">{children}</div>
      {error && onRetry && (
        <button
          onClick={() => {
            void onRetry();
          }}
          className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw size={11} aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </article>
  );
}

// ─── Hello card ───────────────────────────────────────────────────────────────

function HelloCard(): React.JSX.Element {
  const { t } = useTranslation('common');
  const { data, isLoading, isError, refetch } = useGetHelloQuery();

  if (isLoading) return <CardSkeleton />;

  if (isError || !data?.payload) {
    return (
      <StatusCard
        icon={<MessageSquare size={20} />}
        title={t('apiStatus.helloTitle')}
        onRetry={refetch}
        retryLabel={t('apiStatus.retry')}
        error
      >
        {t('apiStatus.errorFetch')}
      </StatusCard>
    );
  }

  const { message, timestamp } = data.payload;
  const time = new Date(timestamp).toLocaleTimeString();

  return (
    <StatusCard icon={<MessageSquare size={20} />} title={t('apiStatus.helloTitle')}>
      <p>{message}</p>
      <p className="mt-1 text-xs text-muted-foreground/60">{time}</p>
    </StatusCard>
  );
}

// ─── Health card ──────────────────────────────────────────────────────────────

function HealthCard(): React.JSX.Element {
  const { t } = useTranslation('common');
  const { data, isLoading, isError, refetch } = useGetHealthQuery();

  if (isLoading) return <CardSkeleton />;

  if (isError || !data?.payload) {
    return (
      <StatusCard
        icon={<Server size={20} />}
        title={t('apiStatus.healthTitle')}
        onRetry={refetch}
        retryLabel={t('apiStatus.retry')}
        error
      >
        {t('apiStatus.errorFetch')}
      </StatusCard>
    );
  }

  const { status, stats } = data.payload;
  const summary = stats
    .slice(0, 2)
    .map((s) => `${s.name}: ${s.value}`)
    .join(' · ');

  return (
    <StatusCard icon={<Server size={20} />} title={t('apiStatus.healthTitle')}>
      <p className="flex items-center gap-1.5">
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            status === 'ok' ? 'bg-green-500' : 'bg-destructive',
          )}
          aria-hidden="true"
        />
        <span className="capitalize">{status}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60">{summary}</p>
    </StatusCard>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

/**
 * Two compact status cards showing live data from /api/hello and /api/health.
 * Styled to match the hero feature cards.
 */
export function ApiStatusCards(): React.JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <HelloCard />
      <HealthCard />
    </div>
  );
}
