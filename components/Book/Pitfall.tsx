import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface PitfallProps {
  /** The specific failure, stated as a short noun phrase (e.g. "Bad controls"). */
  title?: string;
  children: React.ReactNode;
}

/**
 * Pitfall — a compact, inline warning about ONE specific way a method fails.
 *
 * Deliberately lighter than a full "## What Can Go Wrong" section: drop it in
 * exactly where the failure is relevant, name the trap in the title, and give
 * the one-line fix in the body. Use it instead of a section heading when a
 * chapter has a single real failure mode rather than a catalogue of them.
 */
export function Pitfall({ title, children }: PitfallProps) {
  return (
    <aside className="my-6 not-prose rounded-md border border-rose-200 bg-rose-50/70 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
        <AlertTriangle size={14} strokeWidth={2.5} aria-hidden="true" />
        <span>Pitfall{title ? <span className="normal-case font-medium text-rose-900"> — {title}</span> : null}</span>
      </p>
      <div className="mt-2 text-sm leading-relaxed text-rose-950/85 [&_a]:underline [&_strong]:font-semibold [&_strong]:text-rose-950">
        {children}
      </div>
    </aside>
  );
}
