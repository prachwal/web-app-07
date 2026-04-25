import { AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '@/store';
import { removeNotification } from '@/store/slices/notificationsSlice';
import { useIsMobile } from '@/lib/useBreakpoint';
import { cn } from '@/lib/utils';
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
  const isMobile = useIsMobile();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'fixed z-50 flex flex-col pointer-events-none',
        isMobile ? 'bottom-6 left-3 right-3 items-stretch gap-1.5' : 'bottom-4 right-4 items-end gap-2',
      )}
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
