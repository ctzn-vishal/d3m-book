import * as React from 'react';

export interface TakeawayProps {
  /** Eyebrow label. Defaults to "Managerial takeaway"; vary it to avoid monotony. */
  label?: string;
  children: React.ReactNode;
}

/**
 * Takeaway — the closing "what a manager should do with this" block.
 *
 * Replaces the repeated "## Managerial Takeaway" heading + blockquote with a
 * single distinct card, so the close reads as a deliberate landing rather
 * than another section. Vary `label` ("The bottom line", "What to ship",
 * "Decision rule") so consecutive chapters don't feel stamped from a mould.
 */
export function Takeaway({ label = 'Managerial takeaway', children }: TakeawayProps) {
  return (
    <aside className="my-10 not-prose rounded-lg border border-border bg-card p-6 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-primary">
        {label}
      </p>
      <div className="mt-2.5 text-[15px] leading-relaxed text-body [&_a]:text-link [&_a]:underline [&_em]:italic [&_strong]:font-semibold [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </aside>
  );
}
