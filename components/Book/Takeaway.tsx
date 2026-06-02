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
    <aside className="my-9 not-prose rounded-md border border-sky-200 bg-sky-50/60 px-4 py-4 shadow-sm shadow-sky-100/60 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">
        {label}
      </p>
      <div className="mt-2 text-[14.5px] leading-relaxed text-slate-900 [&_a]:text-link [&_a]:underline [&_em]:italic [&_strong]:font-semibold [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </aside>
  );
}
