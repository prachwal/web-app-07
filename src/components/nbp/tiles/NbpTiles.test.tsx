import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, createTestStore } from '@/test/utils';
import { setTileColumns, setTileItemsPerPage } from '@/store/slices/tableSettingsSlice';
import { NbpTiles } from './NbpTiles';
import type { NbpRate } from '@/store/api/nbpApi';

const mockRates: NbpRate[] = [
  { currency: 'dolar amerykański', code: 'USD', mid: 3.9812 },
  { currency: 'euro', code: 'EUR', mid: 4.2541 },
];

const baseProps = {
  onToggleFavorite: vi.fn(),
  onRetry: vi.fn(),
};

describe('NbpTiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders exchange rate tiles for tab A', () => {
    renderWithProviders(
      <NbpTiles
        {...baseProps}
        tab="A"
        rates={mockRates}
        isLoading={false}
        isFetching={false}
        favorites={[]}
        page={1}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
  });

  it('uses tile items per page and tile columns from settings', () => {
    const store = createTestStore();
    store.dispatch(setTileItemsPerPage({ group: 'A', itemsPerPage: 6 }));
    store.dispatch(setTileColumns({ group: 'A', columns: 2 }));

    const { container } = renderWithProviders(
      <NbpTiles
        {...baseProps}
        tab="A"
        rates={Array.from({ length: 7 }).map((_, i) => ({
          currency: `currency-${i}`,
          code: `C${i}`.slice(0, 3),
          mid: i + 1,
        }))}
        isLoading={false}
        isFetching={false}
        favorites={[]}
        page={1}
        onPageChange={vi.fn()}
      />,
      { store },
    );

    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
    const grid = container.querySelector('.grid.gap-3');
    expect(grid?.className).toContain('sm:grid-cols-2');
  });
});
