import { useTranslation } from 'react-i18next';
import { ApiErrorState } from '@/components/ui/StateDisplay';

export interface DataErrorProps {
  onRetry: () => void;
  className?: string;
}

/** NBP-specific error state — wraps ApiErrorState with translated strings. */
export function DataError({ onRetry, className }: DataErrorProps): React.JSX.Element {
  const { t } = useTranslation('nbp');
  return (
    <ApiErrorState
      title={t('errors.fetch')}
      onRetry={onRetry}
      retryLabel={t('errors.retry')}
      className={className}
    />
  );
}
