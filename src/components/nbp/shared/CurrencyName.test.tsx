import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrencyName } from './CurrencyName';

describe('CurrencyName', () => {
  it('renders the currency name text', () => {
    render(<CurrencyName name="US dollar" />);
    expect(screen.getByText('US dollar')).toBeInTheDocument();
  });

  it('sets title attribute to the full name', () => {
    const { container } = render(<CurrencyName name="Euro" />);
    const span = container.querySelector('span');
    expect(span).toHaveAttribute('title', 'Euro');
  });

  it('applies custom className', () => {
    const { container } = render(<CurrencyName name="Pound" className="custom-class" />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('custom-class');
  });

  it('applies default mobileMaxWidth class', () => {
    const { container } = render(<CurrencyName name="Yen" />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('max-w-[120px]');
  });

  it('applies custom mobileMaxWidth class', () => {
    const { container } = render(<CurrencyName name="Franc" mobileMaxWidth="max-w-[200px]" />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('max-w-[200px]');
  });
});
