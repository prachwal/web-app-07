import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Props for the {@link BottomSheet} component. */
export interface BottomSheetProps {
  /** Whether the sheet is open. */
  open: boolean;
  /** Called when the user dismisses the sheet (backdrop click or Escape key). */
  onClose: () => void;
  /** Sheet body content. */
  children: React.ReactNode;
  /** Accessible label forwarded to `aria-label` on the dialog element. */
  ariaLabel?: string;
  /** Element that should receive focus when the sheet opens. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Optional id forwarded to the dialog element. */
  id?: string;
}

/**
 * Accessible mobile bottom-sheet drawer.
 *
 * - Slides up from the bottom of the viewport using a spring animation.
 * - Respects `prefers-reduced-motion` (fades instead of sliding).
 * - Backdrop click and Escape key both dismiss the sheet.
 * - Focus is returned to the previously focused element on close.
 * - AnimatePresence retains the last rendered element tree during exit, so
 *   the panel content stays visible through the slide-down animation without
 *   any manual ref caching.
 *
 * Intended for mobile viewports (`< lg`). On desktop, render an inline panel
 * instead and keep `open` always `false`.
 *
 * @param props - {@link BottomSheetProps}
 */
export function BottomSheet({
  open,
  onClose,
  children,
  ariaLabel,
  initialFocusRef,
  id,
}: BottomSheetProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  /* Escape key + focus restoration — combined into one effect for simplicity. */
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        panelRef.current?.focus();
      }
    }, 0);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [initialFocusRef, open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet panel */}
          <motion.div
            ref={panelRef}
            id={id}
            key="sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            tabIndex={-1}
            initial={reducedMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'max-h-[90dvh] overflow-y-auto',
              'rounded-t-2xl border-t border-border bg-background shadow-2xl',
            )}
          >
            {/* Drag handle — decorative visual indicator */}
            <div
              className="sticky top-0 z-10 flex justify-center bg-background/90 py-3 backdrop-blur-sm"
              aria-hidden="true"
            >
              <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-4 pb-10 pt-1">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
