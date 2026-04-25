import { describe, it, expect } from 'vitest';
import { formatAxisNumber } from './format';

describe('formatAxisNumber', () => {
  it('formats ≥ 1 000 with "k" and one decimal', () => {
    expect(formatAxisNumber(12345)).toBe('12.3k');
  });

  it('formats 10 – 999.99 with two decimals', () => {
    expect(formatAxisNumber(450.23)).toBe('450.23');
  });

  it('formats 1 – 9.99 with three decimals', () => {
    expect(formatAxisNumber(4.2831)).toBe('4.283');
  });

  it('formats 0.1 – 0.99 with four decimals', () => {
    expect(formatAxisNumber(0.3241)).toBe('0.3241');
  });

  it('formats < 0.1 with four decimals', () => {
    expect(formatAxisNumber(0.0312)).toBe('0.0312');
  });

  it('returns "0" for zero', () => {
    expect(formatAxisNumber(0)).toBe('0');
  });

  it('returns empty string for non-finite values', () => {
    expect(formatAxisNumber(Infinity)).toBe('');
    expect(formatAxisNumber(NaN)).toBe('');
  });
});
