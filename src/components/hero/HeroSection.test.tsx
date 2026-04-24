import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders the hero section landmark', () => {
    renderWithProviders(<HeroSection />);
    const section = document.querySelector('section[aria-labelledby="hero-heading"]');
    expect(section).toBeInTheDocument();
  });

  it('renders the hero heading', () => {
    renderWithProviders(<HeroSection />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders feature cards list', () => {
    renderWithProviders(<HeroSection />);
    const featureList = screen.getByRole('list', { name: /everything you need/i });
    expect(featureList).toBeInTheDocument();
  });

  it('renders three feature items', () => {
    renderWithProviders(<HeroSection />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });
});
