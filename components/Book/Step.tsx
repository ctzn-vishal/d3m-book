import * as React from 'react';

export interface StepProps {
  /** The step number, rendered in a small circle on the left. */
  number: number;
  /** Bold heading for the step. */
  title: string;
  children: React.ReactNode;
}

/**
 * Step — a single numbered-step block. Use inside a wrapping <ol> or
 * <div> with sibling <Step>s. Better than markdown `1. 2. 3.` because
 * the styling is consistent and the number lives in a fixed-width
 * gutter (so multi-line content lines up).
 *
 * Use for "how to read this chart" sections, "what this means" sections,
 * or process descriptions. NOT for ranked lists where the order is
 * arbitrary — use a regular bulleted list instead.
 */
export function Step({ number, title, children }: StepProps) {
  return (
    <div className="my-4 flex gap-3 not-prose">
      <div className="flex-shrink-0">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-body text-xs font-semibold tabular-nums text-surface">
          {number}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 font-semibold text-body">{title}</div>
        <div className="text-sm leading-relaxed text-subtle">{children}</div>
      </div>
    </div>
  );
}
