import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createTestStore } from '@/test/utils';
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
});
