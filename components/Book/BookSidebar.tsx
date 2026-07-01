'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Book } from '@/lib/book-types';
import { chapterHref } from '@/lib/book-toc';

export interface BookSidebarProps {
  book: Book;
  /** Slug of the article currently being read; highlighted and auto-scrolled into view. */
  currentSlug?: string;
  /** Part to expand/highlight when there's no current article (cover, part-landing pages). */
  activePartNumeral?: string;
}

function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

/**
 * Persistent left navigation rail for the reading view — a docs-style
 * accordion. Each part collapses to a single row; the part containing the
 * current article is expanded by default, and any part can be toggled open.
 * The current article is highlighted and centered in the rail's own scroll
 * area on load (never touching window scroll). Fixed-open on lg+ screens; below
 * lg the floating ChapterTocDrawer takes over.
 */
export function BookSidebar({ book, currentSlug, activePartNumeral: activePartNumeralProp }: BookSidebarProps) {
  const activePartNumeral = React.useMemo(() => {
    const bySlug = book.parts.find(p =>
      p.chapters.some(c => c.articles.some(a => a.slug === currentSlug))
    );
    // An article's part takes precedence; otherwise fall back to the explicit
    // part prop (part-landing pages); otherwise nothing is active (bare cover).
    return bySlug?.numeral ?? activePartNumeralProp ?? '';
  }, [book, currentSlug, activePartNumeralProp]);

  // Only the active part is open on load; the reader can expand others.
  const [open, setOpen] = React.useState<Set<string>>(
    () => new Set(activePartNumeral ? [activePartNumeral] : [])
  );

  const toggle = (numeral: string) =>
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(numeral)) next.delete(numeral);
      else next.add(numeral);
      return next;
    });

  const scrollRef = React.useRef<HTMLElement>(null);
  const activeRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    const container = scrollRef.current;
    const active = activeRef.current;
    if (!container || !active) return;
    // Center the active link within the rail's OWN scroll area — never window scroll.
    const target = active.offsetTop - container.clientHeight / 2 + active.clientHeight / 2;
    container.scrollTop = Math.max(0, target);
  }, [currentSlug]);

  return (
    <aside className="hidden lg:block" aria-label="Book contents">
      <nav
        ref={scrollRef}
        className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain py-8 pr-2"
      >
        <Link
          href="/teaching"
          className="mb-4 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-link"
        >
          <span aria-hidden="true">←</span> Contents
        </Link>

        <ol className="space-y-0.5">
          {book.parts.map(part => {
            const isOpen = open.has(part.numeral);
            const partActive = part.numeral === activePartNumeral;
            return (
              <li key={part.numeral}>
                <div className="flex w-full items-start gap-1.5 rounded-md px-1 py-1.5 transition-colors hover:bg-card">
                  {/* Toggle-only: expands/collapses without navigating, so a
                      reader can peek at another part's chapters without
                      leaving the article they're on. */}
                  <button
                    type="button"
                    onClick={() => toggle(part.numeral)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} Part ${part.numeral}`}
                    className="-m-1.5 shrink-0 rounded p-1.5 text-muted transition-colors hover:text-body"
                  >
                    <ChevronRight
                      size={14}
                      className={['transition-transform duration-200', isOpen ? 'rotate-90' : ''].join(' ')}
                    />
                  </button>
                  {/* Navigates to the part's overview page; does not toggle. */}
                  <Link href={`/teaching/part/${part.numeral}`} className="min-w-0 flex-1 text-left">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      Part {part.numeral}
                    </span>
                    <span
                      className={[
                        'block font-display text-[12.5px] font-semibold leading-snug',
                        partActive ? 'text-body' : 'text-subtle',
                      ].join(' ')}
                    >
                      {part.title}
                    </span>
                  </Link>
                </div>

                {isOpen && (
                  <ol className="mb-3 mt-1.5 space-y-3 pl-2.5">
                    {part.chapters.map(chapter => (
                      <li key={chapter.number}>
                        <Link
                          href={chapterHref(chapter)}
                          className="flex gap-1.5 px-1 text-[11.5px] font-medium leading-snug text-subtle transition-colors hover:text-link"
                        >
                          <span className="font-mono tabular-nums text-muted">
                            {String(chapter.number).padStart(2, '0')}
                          </span>
                          <span>{chapter.title}</span>
                        </Link>

                        <ul className="mt-1 border-l border-border">
                          {chapter.articles.map(article => {
                            const isCurrent = article.slug === currentSlug;
                            const isLinkable = article.status === 'published' || isCurrent;
                            if (!isLinkable) {
                              return (
                                <li key={article.slug}>
                                  <span className="block py-1 pl-3.5 text-[12px] leading-snug text-muted/70">
                                    {article.title}
                                  </span>
                                </li>
                              );
                            }
                            return (
                              <li key={article.slug}>
                                <Link
                                  ref={isCurrent ? activeRef : undefined}
                                  href={`/${article.slug}`}
                                  aria-current={isCurrent ? 'page' : undefined}
                                  className={[
                                    '-ml-px block border-l-2 py-1 pl-3.5 text-[12.5px] leading-snug transition-colors',
                                    isCurrent
                                      ? 'border-link bg-sky-50/70 font-semibold text-body'
                                      : 'border-transparent text-muted hover:border-border-strong hover:text-body',
                                  ].join(' ')}
                                >
                                  <span className="mr-1.5 font-mono text-[10.5px] tabular-nums text-muted">
                                    {formatArticleNumber(article.number)}
                                  </span>
                                  {article.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
