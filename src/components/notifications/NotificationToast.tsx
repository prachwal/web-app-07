import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Notification } from '@/store/slices/notificationsSlice';

const TYPE_STYLES: Record<Notification['type'], string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
  success:
    'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
  warning:
    'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
  error:
    'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
};

interface NotificationToastProps {
  /** The notification data to display. */
  notification: Notification;
  /** Callback to dismiss this notification by its id. */
  onDismiss: (id: string) => void;
  /** Visual state controlled by the container for CSS transitions. */
  state?: 'entering' | 'entered' | 'exiting';
  /** Whether motion should be reduced to an immediate state change. */
  reduceMotion?: boolean;
}

/**
 * A single toast notification with auto-dismiss and slide-in animation.
 * Respects `prefers-reduced-motion`.
 *
 * @param props - {@link NotificationToastProps}
 * @returns A toast element
 */
export function NotificationToast({
  notification,
  onDismiss,
  state = 'entered',
  reduceMotion = false,
}: NotificationToastProps): React.JSX.Element {
  const { t } = useTranslation('common');
  const duration = notification.duration ?? 4000;

  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => onDismiss(notification.id), duration);
    return () => clearTimeout(timer);
  }, [notification.id, duration, onDismiss]);

  const animatedState = reduceMotion ? 'entered' : state;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'pointer-events-auto flex w-full min-w-0 items-start gap-3 rounded-lg border px-3 py-3 shadow-md',
        'max-w-full text-sm break-words sm:min-w-64 sm:max-w-sm sm:px-4',
        reduceMotion
          ? 'opacity-100'
          : 'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
        animatedState === 'entered'
          ? 'opacity-100 translate-y-0 sm:translate-x-0'
          : 'opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2',
        TYPE_STYLES[notification.type],
      )}
    >
      <span className="flex-1">{notification.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(notification.id)}
        aria-label={t('notifications.close')}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
        >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
