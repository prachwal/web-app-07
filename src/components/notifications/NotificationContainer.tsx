import { AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '@/store';
import { removeNotification } from '@/store/slices/notificationsSlice';
import { NotificationToast } from './NotificationToast';

/**
 * Fixed-position container that renders all active toast notifications.
 * Uses `aria-live="polite"` so screen readers announce new notifications.
 *
 * @returns The notification container element
 */
export function NotificationContainer(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={(id) => dispatch(removeNotification(id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
