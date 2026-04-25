import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, createTestStore } from '@/test/utils';
import { setTableRowsPerPage } from '@/store/slices/tableSettingsSlice';
import { NbpGrid } from './NbpGrid';
import type { NbpRate, NbpGoldPrice } from '@/store/api/nbpApi';

const mockRates: NbpRate[] = [
  { currency: 'dolar amerykański', code: 'USD', mid: 3.9812 },
  { currency: 'euro', code: 'EUR', mid: 4.2541 },
  { currency: 'frank szwajcarski', code: 'CHF', mid: 4.4321 },
];

const mockGold: NbpGoldPrice[] = [
  { data: '2024-04-22', cena: 345.67 },
  { data: '2024-04-23', cena: 347.12 },
];

const baseProps = {
  onRateSelect: vi.fn(),
  onGoldSelect: vi.fn(),
  onRetry: vi.fn(),
};

describe('NbpGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton rows while loading (tab A)', () => {
    renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="A"
        isLoading
        isFetching={false}
      />,
    );
    const table = document.querySelector('table');
    expect(table).toHaveAttribute('aria-busy', 'true');
  });

  it('renders exchange rate rows for tab A', () => {
    renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="A"
        rates={mockRates}
        isLoading={false}
        isFetching={false}
      />,
    );
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('dolar amerykański')).toBeInTheDocument();
    expect(screen.getByText('3.9812')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
  });

  it('renders gold price rows for gold tab', () => {
    renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="gold"
        goldPrices={mockGold}
        isLoading={false}
        isFetching={false}
      />,
    );
    expect(screen.getByText('2024-04-22')).toBeInTheDocument();
    expect(screen.getByText('345.67')).toBeInTheDocument();
  });

  it('shows no-data message when rates array is empty', () => {
    renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="A"
        rates={[]}
        isLoading={false}
        isFetching={false}
      />,
    );
    expect(screen.getByText(/no data|brak danych/i)).toBeInTheDocument();
  });

  it('shows error state and retry button', () => {
    renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="A"
        isLoading={false}
        isFetching={false}
        error={new Error('Network error')}
      />,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry|spróbuj/i });
    fireEvent.click(retryBtn);
    expect(baseProps.onRetry).toHaveBeenCalledOnce();
  });

  it('calls onRateSelect when a rate row is clicked', () => {
    renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="A"
        rates={mockRates}
        isLoading={false}
        isFetching={false}
      />,
    );
    fireEvent.click(screen.getByText('USD').closest('tr')!);
    expect(baseProps.onRateSelect).toHaveBeenCalledWith(mockRates[0]);
  });

  it('calls onGoldSelect when a gold row is clicked', () => {
    renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="gold"
        goldPrices={mockGold}
        isLoading={false}
        isFetching={false}
      />,
    );
    fireEvent.click(screen.getByText('2024-04-22').closest('tr')!);
    expect(baseProps.onGoldSelect).toHaveBeenCalledWith(mockGold[0]);
  });

  it('applies opacity class when isFetching and data is available', () => {
    const { container } = renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="A"
        rates={mockRates}
        isLoading={false}
        isFetching
      />,
    );
    const wrapper = container.querySelector('.overflow-hidden');
    expect(wrapper?.className).toMatch(/opacity-60/);
  });

  it('highlights the selected rate row', () => {
    renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="A"
        rates={mockRates}
        isLoading={false}
        isFetching={false}
        selectedCode="EUR"
      />,
    );
    const row = screen.getByText('EUR').closest('tr');
    expect(row?.className).toMatch(/bg-primary/);
  });

  it('calls onRateSelect when Enter is pressed on a row', () => {
    renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="A"
        rates={mockRates}
        isLoading={false}
        isFetching={false}
      />,
    );
    const row = screen.getByText('CHF').closest('tr')!;
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(baseProps.onRateSelect).toHaveBeenCalledWith(mockRates[2]);
  });

  it('uses table rows per page from settings', () => {
    const store = createTestStore();
    store.dispatch(setTableRowsPerPage({ group: 'A', rowsPerPage: 10 }));

    renderWithProviders(
      <NbpGrid
        {...baseProps}
        tab="A"
        rates={Array.from({ length: 11 }).map((_, i) => ({
          currency: `currency-${i}`,
          code: `C${i}`.slice(0, 3),
          mid: i + 1,
        }))}
        isLoading={false}
        isFetching={false}
        onPageChange={vi.fn()}
      />,
      { store },
    );

    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });
});
