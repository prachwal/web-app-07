import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createTestStore } from '@/test/utils';
import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
  it('shows the mobile navigation section', () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByRole('heading', { name: /mobile navigation/i })).toBeInTheDocument();
  });

  it('toggles all mobile navigation preferences', async () => {
    const store = createTestStore();
    renderWithProviders(<SettingsPage />, { store });
    const user = userEvent.setup();

    const animateBackdrop = screen.getByRole('checkbox', { name: /animate backdrop/i });
    const animatePanel = screen.getByRole('checkbox', { name: /animate panel/i });
    const closeOnLink = screen.getByRole('checkbox', { name: /close on link tap/i });
    const closeOnEscape = screen.getByRole('checkbox', { name: /close on escape/i });

    await user.click(animateBackdrop);
    await user.click(animatePanel);
    await user.click(closeOnLink);
    await user.click(closeOnEscape);

    expect(store.getState().uiPreferences).toEqual({
      animateBackdrop: false,
      animatePanel: false,
      closeOnLink: false,
      closeOnEscape: false,
    });
  });
});
