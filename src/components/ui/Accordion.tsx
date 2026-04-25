import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItemProps {
  title: string;
  /** Short summary shown in collapsed state next to the chevron. */
  summary?: string;
  /** Controlled open state. */
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Single controlled accordion item.
 *
 * Accessibility: uses aria-expanded + aria-controls + role="region".
 * Animation: CSS max-height transition — no framer-motion dependency.
 */
export function AccordionItem({
  title,
  summary,
  open,
  onToggle,
  children,
  className,
}: AccordionItemProps): React.JSX.Element {
  const id = useId();
  const triggerId = `accordion-trigger-${id}`;
  const panelId = `accordion-panel-${id}`;

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-background', className)}>
      <button
        id={triggerId}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
      >
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {summary && (
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{summary}</div>
          )}
        </div>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* CSS-animated panel — avoids layout shift from display:none */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={cn(
          'grid transition-[grid-template-rows] duration-200',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border px-3 py-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Multi-item accordion (single-open variant)
// ─────────────────────────────────────────────────────────────────────────────

export interface AccordionProps<T extends string> {
  items: {
    key: T;
    title: string;
    summary?: string;
    content: React.ReactNode;
  }[];
  openKey: T | null;
  onToggle: (key: T) => void;
  className?: string;
}

/**
 * Controlled multi-item accordion.
 * Only one item is open at a time — pass null to close all.
 */
export function Accordion<T extends string>({
  items,
  openKey,
  onToggle,
  className,
}: AccordionProps<T>): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.key}
          title={item.title}
          summary={item.summary}
          open={openKey === item.key}
          onToggle={() => onToggle(item.key)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
