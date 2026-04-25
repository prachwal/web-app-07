import { screen, within, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { Header } from './Header';

describe('Header', () => {
  it('renders the site logo link', () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole('link', { name: /demoapp/i })).toBeInTheDocument();
  });

  it('renders desktop theme toggle buttons', () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole('button', { name: /jasny/i })).toBeInTheDocument();
  });

  it('opens mobile nav when hamburger is clicked', async () => {
    renderWithProviders(<Header />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /otwórz menu/i }));
    expect(screen.getByRole('dialog', { name: /otwórz menu/i })).toBeInTheDocument();
  });

  it('closes mobile nav when backdrop is clicked', async () => {
    renderWithProviders(<Header />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /otwórz menu/i }));
    // The backdrop is aria-hidden; click it by finding the overlay div
    const backdrop = document.querySelector('[aria-hidden="true"].fixed.inset-0') as HTMLElement;
    if (backdrop) await user.click(backdrop);
    await waitFor(() =>
      expect(screen.getByRole('dialog')).toHaveClass('-translate-x-full'),
    );
  });

  it('shows theme and language controls inside the mobile menu', async () => {
    renderWithProviders(<Header />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /otwórz menu/i }));
    const dialog = screen.getByRole('dialog', { name: /otwórz menu/i });
    expect(within(dialog).getByRole('group', { name: /przełącz motyw/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: /zmień język/i })).toBeInTheDocument();
  });
});
