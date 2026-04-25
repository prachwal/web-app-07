import { cn } from '@/lib/utils';
import { HeroHeading } from './HeroHeading';
import { HeroActions } from './HeroActions';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { Layers, ShieldCheck, Palette } from 'lucide-react';

const featureIcons = [Layers, ShieldCheck, Palette];

export interface HeroSectionProps {
  /** Optional content rendered below the feature cards, inside the same container. */
  children?: React.ReactNode;
}

/**
 * Hero section component with ARIA landmarks, animated content, and feature cards.
 * Meets WCAG AA contrast requirements using CSS custom property color tokens.
 *
 * @param props - {@link HeroSectionProps}
 * @returns The hero section element
 */
export function HeroSection({ children }: HeroSectionProps = {}): React.JSX.Element {
  const { t } = useTranslation('hero');
  const shouldReduce = useReducedMotion();

  const cardVariants = (index: number) => ({
    hidden: shouldReduce ? {} : { opacity: 0, y: 20 },
    visible: shouldReduce
      ? {}
      : {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, delay: 0.5 + index * 0.1, ease: 'easeOut' as const },
        },
  });

  const features = t('features.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;

  return (
    <section
      aria-labelledby="hero-heading"
      className={cn('relative overflow-hidden', 'bg-background py-20 sm:py-28 lg:py-36')}
    >
      {/* Decorative background gradient */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0',
          'bg-[radial-gradient(ellipse_at_top,_var(--color-accent)_0%,_transparent_60%)]',
          'opacity-40 dark:opacity-20',
        )}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero heading + actions */}
        <div className="mb-16 max-w-3xl space-y-8">
          <HeroHeading />
          <HeroActions />
        </div>

        {/* Feature cards */}
        <div role="list" aria-label={t('features.title')} className="grid gap-4 sm:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = featureIcons[index] ?? Layers;
            return (
              <motion.article
                key={feature.title}
                role="listitem"
                initial="hidden"
                animate="visible"
                variants={cardVariants(index)}
                className={cn(
                  'rounded-xl border border-border bg-card p-6',
                  'transition-shadow hover:shadow-md',
                )}
              >
                <div
                  className={cn(
                    'mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg',
                    'bg-primary/10 text-primary',
                  )}
                  aria-hidden="true"
                >
                  <Icon size={20} />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.article>
            );
          })}
        </div>

        {children && <div className="mt-4">{children}</div>}
      </div>
    </section>
  );
}
