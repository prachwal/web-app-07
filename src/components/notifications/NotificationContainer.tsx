import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectUiPreferences } from '@/store/slices/uiPreferencesSlice';
import { removeNotification } from '@/store/slices/notificationsSlice';
import { useIsMobile } from '@/lib/useBreakpoint';
import { cn } from '@/lib/utils';
import type { Notification } from '@/store/slices/notificationsSlice';
import { NotificationToast } from './NotificationToast';

type ToastState = 'entering' | 'entered' | 'exiting';

interface VisibleNotification extends Notification {
  state: ToastState;
}

const ENTER_DELAY_MS = 20;
const EXIT_DELAY_MS = 200;

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
  const { notificationsEnabled, reduceMotion } = useAppSelector(selectUiPreferences);
  const [visibleNotifications, setVisibleNotifications] = useState<VisibleNotification[]>([]);
  const visibleRef = useRef<VisibleNotification[]>([]);
  const enterTimers = useRef(new Map<string, number>());
  const exitTimers = useRef(new Map<string, number>());
  const handleDismiss = useCallback((id: string) => dispatch(removeNotification(id)), [dispatch]);

  useEffect(() => {
    visibleRef.current = visibleNotifications;
  }, [visibleNotifications]);

  useEffect(() => {
    const clearTimers = (timers: Map<string, number>) => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }
      timers.clear();
    };

    if (!notificationsEnabled) {
      clearTimers(enterTimers.current);
      clearTimers(exitTimers.current);
      setVisibleNotifications([]);
      return;
    }

    if (reduceMotion) {
      clearTimers(enterTimers.current);
      clearTimers(exitTimers.current);
      setVisibleNotifications(notifications.map((notification) => ({ ...notification, state: 'entered' })));
      return;
    }

    const current = visibleRef.current;
    const currentById = new Map(current.map((item) => [item.id, item]));
    const nextIds = new Set(notifications.map((notification) => notification.id));
    const enteringIds: string[] = [];
    const exitingIds: string[] = [];

    const next: VisibleNotification[] = notifications.map((notification) => {
      const existing = currentById.get(notification.id);
      if (existing) {
        if (existing.state === 'exiting') {
          const timer = exitTimers.current.get(notification.id);
          if (timer !== undefined) {
            window.clearTimeout(timer);
            exitTimers.current.delete(notification.id);
          }
          enteringIds.push(notification.id);
          return { ...notification, state: 'entering' };
        }

        return { ...notification, state: existing.state };
      }

      enteringIds.push(notification.id);
      return { ...notification, state: 'entering' };
    });

    for (const item of current) {
      if (nextIds.has(item.id) || item.state === 'exiting') continue;
      exitingIds.push(item.id);
      next.push({ ...item, state: 'exiting' });
    }

    setVisibleNotifications(next);

    for (const id of enteringIds) {
      if (enterTimers.current.has(id)) continue;
      const timer = window.setTimeout(() => {
        enterTimers.current.delete(id);
        setVisibleNotifications((currentItems) =>
          currentItems.map((item) => (item.id === id ? { ...item, state: 'entered' } : item)),
        );
      }, ENTER_DELAY_MS);
      enterTimers.current.set(id, timer);
    }

    for (const id of exitingIds) {
      if (exitTimers.current.has(id)) continue;
      const timer = window.setTimeout(() => {
        exitTimers.current.delete(id);
        setVisibleNotifications((currentItems) => currentItems.filter((item) => item.id !== id));
      }, EXIT_DELAY_MS);
      exitTimers.current.set(id, timer);
    }
  }, [notifications, notificationsEnabled, reduceMotion]);

  useEffect(() => {
    return () => {
      for (const timer of enterTimers.current.values()) {
        window.clearTimeout(timer);
      }
      for (const timer of exitTimers.current.values()) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  if (!notificationsEnabled) return <></>;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'fixed z-50 flex flex-col pointer-events-none',
        isMobile ? 'bottom-6 left-3 right-3 items-stretch gap-1.5' : 'bottom-4 right-4 items-end gap-2',
      )}
    >
      {visibleNotifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={handleDismiss}
          state={notification.state}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}
