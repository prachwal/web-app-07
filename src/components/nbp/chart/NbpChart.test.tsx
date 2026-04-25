import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { NbpChart } from './NbpChart';

describe('NbpChart basic render', () => {
  it('renders no-data state', () => {
    const { getByText } = renderWithProviders(<NbpChart data={[]} isLoading={false} tab="A" />);
    expect(getByText(/no data|brak danych/i)).toBeInTheDocument();
  });
});
