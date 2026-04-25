import { describe, it, expect, vi, beforeAll } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { NbpChart } from '@/components/nbp/chart/NbpChart';
import type { ChartPoint } from '@/components/nbp/chart/NbpChart';

/* ── recharts requires ResizeObserver and SVG layout APIs not in jsdom ── */
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // Recharts calls getBoundingClientRect on container elements
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 400,
    height: 280,
    top: 0,
    left: 0,
    right: 400,
    bottom: 280,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));
});

const MID_POINTS: ChartPoint[] = [
  { date: '2024-01-02', mid: 3.95 },
  { date: '2024-01-03', mid: 3.97 },
  { date: '2024-01-04', mid: 4.01 },
];

const BIDASK_POINTS: ChartPoint[] = [
  { date: '2024-01-02', bid: 3.90, ask: 4.00 },
  { date: '2024-01-03', bid: 3.92, ask: 4.02 },
];

const GOLD_POINTS: ChartPoint[] = [
  { date: '2024-01-02', cena: 245.50 },
  { date: '2024-01-03', cena: 246.10 },
];

describe('NbpChart', () => {
  it('shows loading skeleton when isLoading=true', () => {
    renderWithProviders(<NbpChart data={[]} isLoading={true} tab="A" />);
    const skeleton = document.querySelector('[aria-busy="true"]');
    expect(skeleton).toBeTruthy();
  });

  it('shows no-data message when data is empty and not loading', () => {
    renderWithProviders(<NbpChart data={[]} isLoading={false} tab="A" currency="USD" />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('renders chart container with correct role and aria-label for Table A', () => {
    renderWithProviders(<NbpChart data={MID_POINTS} isLoading={false} tab="A" currency="USD" />);
    const container = document.querySelector('[role="img"]');
    expect(container).toBeTruthy();
    expect(container?.getAttribute('aria-label')).toMatch(/USD/);
  });

  it('renders chart for Table B', () => {
    renderWithProviders(<NbpChart data={MID_POINTS} isLoading={false} tab="B" currency="EUR" />);
    expect(document.querySelector('[role="img"]')).toBeTruthy();
  });

  it('renders chart for Table C (bid/ask) without errors', () => {
    renderWithProviders(<NbpChart data={BIDASK_POINTS} isLoading={false} tab="C" currency="USD" />);
    const container = document.querySelector('[role="img"]');
    expect(container).toBeTruthy();
  });

  it('renders chart for gold without errors', () => {
    renderWithProviders(<NbpChart data={GOLD_POINTS} isLoading={false} tab="gold" />);
    const container = document.querySelector('[role="img"]');
    expect(container).toBeTruthy();
    expect(container?.getAttribute('aria-label')).toMatch(/gold|price|cena|chart/i);
  });
});
