'use client';

import * as React from 'react';

export interface PullQuoteProps {
  children: React.ReactNode;
}

/**
 * PullQuote — large decorative quote that breaks the prose column. Quotes
 * the *article itself* — pulls a key sentence from the surrounding prose
 * so the eye lands on it. NOT for external sources (use <Quote> for
 * those).
 *
 * Use at most once per article. More than one and they cancel each other
 * out.
 */
export function PullQuote({ children }: PullQuoteProps) {
  // Use a <div> rather than a <p> here: in MDX, the children are already
  // wrapped in their own <p> by the auto-paragraph rule, and a <p> inside
  // a <p> is invalid HTML and triggers a hydration error.
  return (
    <aside className="my-12 py-6 border-y border-border-strong not-prose">
      <div className="text-2xl font-serif italic text-subtle leading-snug text-center max-w-2xl mx-auto">
        {children}
      </div>
    </aside>
  );
}
