import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * Animated hero heading with `prefers-reduced-motion` support.
 * Entrance animation is disabled when the user has reduced motion enabled.
 *
 * @returns The hero heading element
 */
export function HeroHeading(): React.JSX.Element {
  const { t } = useTranslation('hero');
  const shouldReduce = useReducedMotion();

  const variants = {
    hidden: shouldReduce ? {} : { opacity: 0, y: 30 },
    visible: shouldReduce
      ? {}
      : { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={variants} className="space-y-4">
      <span
        className={cn(
          'inline-block rounded-full border border-border',
          'bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground',
        )}
      >
        {t('badge')}
      </span>
      <h1
        id="hero-heading"
        className={cn(
          'text-4xl font-bold tracking-tight text-foreground',
          'sm:text-5xl lg:text-6xl',
        )}
      >
        {t('heading')}
      </h1>
      <p className={cn('max-w-2xl text-lg text-muted-foreground', 'sm:text-xl')}>
        {t('subheading')}
      </p>
    </motion.div>
  );
}
