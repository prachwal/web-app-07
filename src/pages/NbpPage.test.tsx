import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { NbpPage } from './NbpPage';

/* ── fetch mock helpers ── */
const makeTableResponse = (table: 'A' | 'B') => [
  {
    table,
    no: `081/${table}/NBP/2024`,
    effectiveDate: '2024-04-25',
    rates: [
      { currency: 'dolar amerykański', code: 'USD', mid: 3.9812 },
      { currency: 'euro', code: 'EUR', mid: 4.2541 },
    ],
  },
];

const makeGoldResponse = () => [
  { data: '2024-04-01', cena: 340.0 },
  { data: '2024-04-02', cena: 341.5 },
];

function mockFetch(data: unknown, ok = true): void {
  const body = JSON.stringify(data);
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(ok ? body : 'Server Error', {
          status: ok ? 200 : 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ),
  );
}

describe('NbpPage', () => {
  beforeEach(() => {
    mockFetch(makeTableResponse('A'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders page heading', () => {
    renderWithProviders(<NbpPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders four tab buttons (A, B, C, Gold)', () => {
    renderWithProviders(<NbpPage />);
    expect(screen.getByRole('tab', { name: /Table A|Tabela A/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Table B|Tabela B/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Table C|Tabela C/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Gold|Złoto/i })).toBeInTheDocument();
  });

  it('shows exchange rate data after fetch', async () => {
    renderWithProviders(<NbpPage />);
    await waitFor(() => expect(screen.getByText('USD')).toBeInTheDocument());
    expect(screen.getByText('dolar amerykański')).toBeInTheDocument();
    expect(screen.getByText('3.9812')).toBeInTheDocument();
  });

  it('filters rates by search query', async () => {
    renderWithProviders(<NbpPage />);
    await waitFor(() => screen.getByText('USD'));

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'euro' } });

    await waitFor(() => {
      expect(screen.queryByText('USD')).not.toBeInTheDocument();
      expect(screen.getByText('EUR')).toBeInTheDocument();
    });
  });

  it('opens details panel when a rate row is clicked', async () => {
    renderWithProviders(<NbpPage />);
    await waitFor(() => screen.getByText('USD'));

    fireEvent.click(screen.getByText('USD').closest('tr')!);

    await waitFor(() => {
      const aside = screen.getByRole('complementary');
      expect(within(aside).getByText('USD')).toBeInTheDocument();
    });
  });

  it('closes details panel when close button is clicked', async () => {
    renderWithProviders(<NbpPage />);
    await waitFor(() => screen.getByText('EUR'));

    fireEvent.click(screen.getByText('EUR').closest('tr')!);
    await waitFor(() => screen.getByRole('complementary'));

    fireEvent.click(screen.getByRole('button', { name: /close|zamknij/i }));
    await waitFor(() => {
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  it('switches to gold tab and shows date range inputs', async () => {
    mockFetch(makeGoldResponse());
    renderWithProviders(<NbpPage />);

    fireEvent.click(screen.getByRole('tab', { name: /Gold|Złoto/i }));

    await waitFor(() => {
      // Two date inputs appear on gold tab
      const dateInputs = document.querySelectorAll('input[type="date"]');
      expect(dateInputs).toHaveLength(2);
      // Clear/reset button also appears
      expect(
        screen.getByRole('button', { name: /Reset dates|Resetuj daty/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows gold price data on gold tab', async () => {
    mockFetch(makeGoldResponse());
    renderWithProviders(<NbpPage />);

    fireEvent.click(screen.getByRole('tab', { name: /Gold|Złoto/i }));

    await waitFor(() => {
      expect(screen.getByText('2024-04-01')).toBeInTheDocument();
      expect(screen.getByText('340.00')).toBeInTheDocument();
    });
  });

  it('shows error state when fetch fails', async () => {
    mockFetch(null, false);
    renderWithProviders(<NbpPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('renders view-mode toggle buttons (grid / chart) for Table A', () => {
    renderWithProviders(<NbpPage />);
    expect(
      screen.getByRole('button', { name: /show table|pokaż tabelę/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /show chart|pokaż wykres/i }),
    ).toBeInTheDocument();
  });

  it('switches to chart mode when chart button is clicked', async () => {
    renderWithProviders(<NbpPage />);

    fireEvent.click(screen.getByRole('button', { name: /show chart|pokaż wykres/i }));

    await waitFor(() => {
      // Chart mode shows currency code input (role may be textbox or combobox with datalist)
      expect(screen.getByLabelText(/currency code|kod waluty/i)).toBeInTheDocument();
    });
  });

  it('shows Table C tab and bid/ask grid headings after switch', async () => {
    const tableCResponse = [
      {
        table: 'C',
        no: '081/C/NBP/2024',
        tradingDate: '2024-04-25',
        effectiveDate: '2024-04-25',
        rates: [
          { currency: 'dolar amerykański', code: 'USD', bid: 3.95, ask: 4.02 },
        ],
      },
    ];
    mockFetch(tableCResponse);
    renderWithProviders(<NbpPage />);

    fireEvent.click(screen.getByRole('tab', { name: /Table C|Tabela C/i }));

    await waitFor(() => {
      // Table C description bar + grid headers both contain 'Buy'; assert at least one present
      expect(screen.getAllByText(/Buy|Kupno/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Sell|Sprzeda/i).length).toBeGreaterThan(0);
    });
  });
});
