import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  id?: string;
}

/**
 * Accessible mobile bottom-sheet drawer.
 *
 * Uses CSS transform + transition (no framer-motion) — eliminates
 * AnimatePresence exit-race issues that appeared when the sheet
 * was torn down while still mid-animation.
 *
 * The panel stays mounted while `open` changes so CSS transition
 * runs fully in both directions. Content is inert when closed via
 * the `inert` attribute, which also removes it from the tab order.
 */
export function BottomSheet({
  open,
  onClose,
  children,
  ariaLabel,
  initialFocusRef,
  id,
}: BottomSheetProps): React.JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);

  // Body scroll lock + focus management + Escape
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus after CSS transition settles (~220ms)
    const focusId = window.setTimeout(() => {
      (initialFocusRef?.current ?? panelRef.current)?.focus();
    }, 220);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(focusId);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus();
    };
  }, [open, onClose, initialFocusRef]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm',
          'transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Sheet panel — always mounted, animated via CSS transform */}
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        // `inert` removes from a11y tree and tab order when closed
        {...(!open ? { inert: true } : {})}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'max-h-[90dvh] overflow-y-auto',
          'rounded-t-2xl border-t border-border bg-background shadow-2xl',
          'transition-transform duration-[220ms] ease-out will-change-transform',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        {/* Drag handle */}
        <div
          className="sticky top-0 z-10 flex justify-center bg-background/90 py-3 backdrop-blur-sm"
          aria-hidden="true"
        >
          <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="px-4 pb-10 pt-1">{children}</div>
      </div>
    </>
  );
}
