import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { NbpChart } from './NbpChart';

describe('NbpChart basic render', () => {
  it('renders no-data state', () => {
    const { getByText } = renderWithProviders(<NbpChart data={[]} isLoading={false} tab="A" />);
    expect(getByText(/no data|brak danych/i)).toBeInTheDocument();
  });

  it('renders analysis summary for chart data', () => {
    const { getByText } = renderWithProviders(
      <NbpChart
        data={[
          { date: '2024-04-01', mid: 3.95 },
          { date: '2024-04-02', mid: 4.05 },
        ]}
        isLoading={false}
        tab="A"
        currency="EUR"
        axisPresentation="combined"
        showLegend={false}
        showGrid={false}
      />,
    );

    expect(getByText(/^Point$/i)).toBeInTheDocument();
    expect(getByText(/^Range$/i)).toBeInTheDocument();
  });
});
