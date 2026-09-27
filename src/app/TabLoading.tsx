import React from 'react';

/**
 * Loading state for a lazily-loaded workbench tab.
 *
 * This is a skeleton, not a progress bar. There is no percentage here because
 * there is no measurable progress to report: the browser is fetching a chunk
 * that is either present or not. Inventing a number that ticks upward would be
 * exactly the kind of fake state this product is supposed to avoid.
 *
 * `role="status"` with `aria-live="polite"` so a screen reader announces the
 * change of surface, and `prefers-reduced-motion` is respected via CSS only.
 */
export const TabLoading: React.FC<{ label: string }> = ({ label }) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    data-testid="tab-loading"
    className="flex-1 flex flex-col gap-4 p-6 animate-in fade-in duration-150"
  >
    <span className="sr-only">Loading {label}</span>
    <div className="flex items-center gap-2 text-[11px] font-mono text-atkin-muted">
      <span
        aria-hidden="true"
        className="w-1.5 h-1.5 rounded-full bg-atkin-ink motion-safe:animate-pulse"
      />
      <span>Loading {label}…</span>
    </div>
    <div aria-hidden="true" className="space-y-3 max-w-[720px]">
      <div className="h-4 w-1/3 rounded-[3px] bg-atkin-bg-subtle" />
      <div className="h-3 w-full rounded-[3px] bg-atkin-bg-subtle" />
      <div className="h-3 w-5/6 rounded-[3px] bg-atkin-bg-subtle" />
      <div className="h-3 w-2/3 rounded-[3px] bg-atkin-bg-subtle" />
      <div className="h-24 w-full rounded-[6px] bg-atkin-bg-subtle mt-5" />
    </div>
  </div>
);
