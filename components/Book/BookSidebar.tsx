'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Book } from '@/lib/book-types';

export interface BookSidebarProps {
  book: Book;
  /** Slug of the article currently being read; highlighted and auto-scrolled into view. */
  currentSlug: string;
}

function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

/**
 * Persistent left navigation rail for the reading view — the full
 * Part → Chapter → Article tree, like a docs sidebar. Fixed-open on lg+ screens
 * (replacing the floating drawer, which takes over below lg). The current
 * article is highlighted and centered in the rail's own scroll area on load, so
 * a reader always lands with their place in view without the page jumping.
 */
export function BookSidebar({ book, currentSlug }: BookSidebarProps) {
  const scrollRef = React.useRef<HTMLElement>(null);
  const activeRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    const container = scrollRef.current;
    const active = activeRef.current;
    if (!container || !active) return;
    // Center the active link within the rail's OWN scroll area — never touch
    // window scroll (which would yank the article on load).
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
          className="mb-5 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-link"
        >
          <span aria-hidden="true">←</span> Contents
        </Link>

        <ol className="space-y-6">
          {book.parts.map(part => {
            const partActive = part.chapters.some(c =>
              c.articles.some(a => a.slug === currentSlug)
            );
            return (
              <li key={part.numeral}>
                <Link
                  href={`/teaching/part/${part.numeral}`}
                  className="block px-1 transition-colors hover:text-link"
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    Part {part.numeral}
                  </span>
                  <span
                    className={[
                      'mt-0.5 block font-display text-[12.5px] font-semibold leading-snug',
                      partActive ? 'text-body' : 'text-subtle',
                    ].join(' ')}
                  >
                    {part.title}
                  </span>
                </Link>

                <ol className="mt-2.5 space-y-3">
                  {part.chapters.map(chapter => (
                    <li key={chapter.number}>
                      <Link
                        href={`/teaching/ch/${chapter.number}`}
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
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
