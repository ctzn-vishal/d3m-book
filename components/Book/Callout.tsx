'use client';

import * as React from 'react';

export type CalloutVariant = 'caveat' | 'definition' | 'finding' | 'aside';

export interface CalloutProps {
  variant?: CalloutVariant;
  /** Heading text. If omitted, falls back to variant default ("Methodological note", "Key finding", or none). */
  title?: string;
  children: React.ReactNode;
}

interface VariantSpec {
  container: string;
  defaultTitle: string | null;
  titleClass?: string;
}

const VARIANTS: Record<CalloutVariant, VariantSpec> = {
  caveat: {
    container:
      'rounded-md border border-amber-200 bg-amber-50/70 px-4 py-3.5 text-sm text-amber-950 shadow-sm shadow-amber-100/60 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100 dark:shadow-none',
    defaultTitle: 'Methodological note',
  },
  definition: {
    container:
      'rounded-md border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200',
    defaultTitle: null,
  },
  finding: {
    container:
      'rounded-md border border-sky-200 bg-sky-50/80 px-4 py-3.5 text-sm text-sky-950 shadow-sm shadow-sky-100/60 dark:border-sky-800/50 dark:bg-sky-950/30 dark:text-sky-100 dark:shadow-none',
    defaultTitle: 'Key finding',
  },
  aside: {
    // No background, no rounded card — feels conversational.
    container:
      'border-l-2 border-slate-200 pl-5 italic text-slate-700 text-[0.95em] dark:border-slate-700 dark:text-slate-300',
    defaultTitle: null,
  },
};

/**
 * Callout — a labelled, visually distinct block of prose.
 *
 * Four variants:
 * - caveat (amber): methodological warnings, e.g. survey mode shifts.
 * - definition (gray): defines a term used throughout the section.
 * - finding (blue): the one-sentence punchline of a section.
 * - aside (italic, no card): a conversational digression.
 *
 * Use sparingly — at most one per section. Callouts that are too frequent
 * lose their visual weight and start to read as decoration.
 */
export function Callout({
  variant = 'caveat',
  title,
  children,
}: CalloutProps) {
  let spec = VARIANTS[variant];
  if (!spec) {
    console.warn(`[Callout] Unrecognized or missing variant "${variant}", falling back to "caveat"`);
    spec = VARIANTS['caveat'];
  }
  const resolvedTitle = title === undefined ? spec.defaultTitle : title;

  return (
    <aside className={`my-7 not-prose leading-relaxed ${spec.container}`}>
      {resolvedTitle && (
        <strong className="mr-1 font-semibold">{resolvedTitle}.</strong>
      )}
      <span>{children}</span>
    </aside>
  );
}
