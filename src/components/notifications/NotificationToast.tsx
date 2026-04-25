import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
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
}: NotificationToastProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const duration = notification.duration ?? 4000;

  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => onDismiss(notification.id), duration);
    return () => clearTimeout(timer);
  }, [notification.id, duration, onDismiss]);

  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={reducedMotion ? false : { opacity: 0, x: 64 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, x: 64 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md',
        'min-w-64 max-w-sm text-sm',
        TYPE_STYLES[notification.type],
      )}
    >
      <span className="flex-1">{notification.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(notification.id)}
        aria-label="Zamknij powiadomienie"
        className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
