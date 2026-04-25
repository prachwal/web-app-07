import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { TableSettingsModal } from './TableSettingsModal';

function mockMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(() => ({
      matches,
      media: '(max-width: 1023px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe('TableSettingsModal mobile accordion', () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens the chart section by default for chart view on mobile', () => {
    renderWithProviders(
      <TableSettingsModal open onClose={() => {}} group="A" viewMode="chart" />,
    );

    const buttons = screen.getAllByRole('button');
    const chartSection = buttons.find((button) => button.getAttribute('aria-expanded') === 'true');
    expect(chartSection).toHaveTextContent(/^Chart/i);
    expect(screen.getByRole('button', { name: /^Layout/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /^Visible columns|Widoczne kolumny/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
