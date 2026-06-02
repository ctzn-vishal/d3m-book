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
    <aside className="my-10 border-y border-border py-5 not-prose">
      <div className="mx-auto max-w-2xl text-center font-serif text-xl italic leading-snug text-subtle sm:text-2xl">
        {children}
      </div>
    </aside>
  );
}
