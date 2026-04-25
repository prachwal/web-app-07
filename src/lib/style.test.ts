import { describe, it, expect, beforeEach } from 'vitest';
import { getCssVar } from './style';

describe('getCssVar', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--test-var');
  });

  it('reads and trims a defined CSS variable', () => {
    document.documentElement.style.setProperty('--test-var', '  trimmed-value  ');
    expect(getCssVar('--test-var', 'fallback')).toBe('trimmed-value');
  });

  it('returns fallback when variable is not defined', () => {
    expect(getCssVar('--non-existent', 'fallback')).toBe('fallback');
  });

  it('returns fallback in non-browser (SSR) environment', () => {
    const origDoc = (globalThis as Record<string, unknown>).document;
    try {
      (globalThis as Record<string, unknown>).document = undefined;
      expect(getCssVar('--any', 'ssr-fallback')).toBe('ssr-fallback');
    } finally {
      (globalThis as Record<string, unknown>).document = origDoc;
    }
  });
});
