import { screen, within, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createTestStore } from '@/test/utils';
import { setCloseOnLink, setCloseOnEscape } from '@/store/slices/uiPreferencesSlice';
import { Header } from './Header';

describe('Header', () => {
  it('renders the site logo link', () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole('link', { name: /demo app/i })).toBeInTheDocument();
  });

  it('renders theme toggle buttons', () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
  });

  it('dispatches setTheme when theme button clicked', async () => {
    const store = createTestStore();
    renderWithProviders(<Header />, { store });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /dark/i }));
    const state = store.getState();
    expect(state.theme.mode).toBe('dark');
  });

  it('opens the mobile menu and closes it when a link is clicked', async () => {
    renderWithProviders(<Header />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));

    const dialog = screen.getByRole('dialog', { name: /open navigation menu/i });
    expect(within(dialog).getByRole('link', { name: /home/i })).toBeInTheDocument();
    await waitFor(() =>
      expect(document.activeElement).toBe(within(dialog).getByRole('link', { name: /home/i })),
    );

    await user.click(within(dialog).getByRole('link', { name: /about/i }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /open navigation menu/i })).not.toBeInTheDocument(),
    );
  });

  it('closes the mobile menu on Escape', async () => {
    renderWithProviders(<Header />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));
    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /open navigation menu/i })).not.toBeInTheDocument(),
    );
  });

  it('closes the mobile menu when the backdrop is clicked', async () => {
    renderWithProviders(<Header />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));
    await user.click(screen.getByTestId('mobile-nav-backdrop'));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /open navigation menu/i })).not.toBeInTheDocument(),
    );
  });

  it('keeps the mobile menu open when closeOnLink is disabled', async () => {
    const store = createTestStore();
    store.dispatch(setCloseOnLink(false));
    renderWithProviders(<Header />, { store });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));
    await user.click(within(screen.getByRole('dialog', { name: /open navigation menu/i })).getByRole('link', { name: /about/i }));

    expect(screen.getByRole('dialog', { name: /open navigation menu/i })).toBeInTheDocument();
  });

  it('keeps the mobile menu open when closeOnEscape is disabled', async () => {
    const store = createTestStore();
    store.dispatch(setCloseOnEscape(false));
    renderWithProviders(<Header />, { store });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('dialog', { name: /open navigation menu/i })).toBeInTheDocument();
  });

  it('shows theme and language controls inside the mobile menu', async () => {
    renderWithProviders(<Header />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));

    const dialog = screen.getByRole('dialog', { name: /open navigation menu/i });
    expect(within(dialog).getByRole('group', { name: /toggle theme/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: /change language/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /english/i })).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /light/i }));
    await waitFor(() =>
      expect(
        within(screen.getByRole('dialog', { name: /open navigation menu/i })).getByRole('button', {
          name: /light/i,
        }),
      ).toBeInTheDocument(),
    );
  });
});
