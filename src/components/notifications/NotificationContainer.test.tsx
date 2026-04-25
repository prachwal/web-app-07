import { describe, it, expect, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, createTestStore } from '@/test/utils';
import { NotificationContainer } from './NotificationContainer';

function installMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

afterEach(() => {
  installMatchMedia(false);
});

describe('NotificationContainer', () => {
  it('uses a mobile-first layout on small viewports', () => {
    installMatchMedia(true);
    const store = createTestStore({
      notifications: {
        items: [
          { id: 'n1', type: 'info', message: 'First notification', duration: 0 },
          { id: 'n2', type: 'success', message: 'Second notification', duration: 0 },
        ],
      },
    });

    renderWithProviders(<NotificationContainer />, { store });

    expect(screen.getByText('First notification')).toBeInTheDocument();
    expect(screen.getByText('Second notification')).toBeInTheDocument();
    const toast = screen.getByText('First notification').closest('div');
    expect(toast).not.toBeNull();
    const container = toast!.parentElement;
    expect(container).not.toBeNull();
    expect(container).toHaveClass('left-3', 'right-3', 'bottom-6', 'items-stretch', 'gap-1.5');
    expect(toast).toHaveClass('w-full');
  });
});
