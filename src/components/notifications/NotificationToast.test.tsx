import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { NotificationToast } from './NotificationToast';

afterEach(() => {
  vi.useRealTimers();
});

describe('NotificationToast', () => {
  it('auto-dismisses after the configured duration', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    renderWithProviders(
      <NotificationToast
        notification={{ id: 'toast-1', type: 'info', message: 'Dismiss me', duration: 1000 }}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    vi.advanceTimersByTime(1000);
    expect(onDismiss).toHaveBeenCalledWith('toast-1');
  });
});
