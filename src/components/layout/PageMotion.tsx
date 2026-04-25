import { motion, useReducedMotion } from 'motion/react';

export interface PageMotionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard fade-in + slide-up page entrance animation.
 * Automatically disabled when user prefers reduced motion.
 * Shared by NbpPage, AboutPage, and any future pages.
 */
export function PageMotion({ children, className }: PageMotionProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
