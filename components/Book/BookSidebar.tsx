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
    <aside className="hidden border-r border-border lg:block" aria-label="Book contents">
      <nav ref={scrollRef} className="sticky top-[4.5rem] max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain py-10 pr-5">
        <Link href="/teaching" className="book-kicker mb-6 flex items-center gap-2 text-muted transition-colors hover:text-body">
          <span aria-hidden="true">←</span> All contents
        </Link>
        <ol className="space-y-3">
          {book.parts.map(part => {
            const isOpen = open.has(part.numeral);
            const partActive = part.numeral === activePartNumeral;
            return (
              <li key={part.numeral}>
                <div className="flex w-full items-start gap-2 py-1 transition-colors">
                  {/* Toggle-only: expands/collapses without navigating, so a
                      reader can peek at another part's chapters without
                      leaving the article they're on. */}
                  <button
                    type="button"
                    onClick={() => toggle(part.numeral)}
                    aria-expanded={isOpen}
                    aria-controls={`book-part-${part.numeral}`}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} Part ${part.numeral}`}
                    className="-ml-1 mt-0.5 shrink-0 rounded p-1 text-muted transition-colors hover:bg-card hover:text-body"
                  >
                    <ChevronRight size={13} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {/* Navigates to the part's overview page; does not toggle. */}
                  <Link href={`/teaching/part/${part.numeral}`} className="min-w-0 flex-1 text-left">
                    <span className={`book-kicker ${partActive ? 'text-accent-ink' : 'text-muted'}`}>Part {part.numeral}</span>
                    <span className={`mt-1 block text-[12px] font-medium leading-relaxed ${partActive ? 'text-body' : 'text-muted hover:text-body'}`}>{part.title}</span>
                  </Link>
                </div>

                <ol id={`book-part-${part.numeral}`} hidden={!isOpen} className="mb-5 mt-3 space-y-4 pl-6">
                  {part.chapters.map(chapter => (
                    <li key={chapter.number}>
                      <Link href={chapterHref(chapter)} className="flex gap-2 text-[11.5px] font-medium leading-relaxed text-subtle transition-colors hover:text-accent-ink">
                        <span className="font-plex text-[10px] tabular-nums text-muted">{String(chapter.number).padStart(2, '0')}</span>
                        <span>{chapter.title}</span>
                      </Link>
                      <ul className="mt-2 border-l border-border">
                        {chapter.articles.map(article => {
                          const isCurrent = article.slug === currentSlug;
                          const isLinkable = article.status === 'published' || isCurrent;
                          if (!isLinkable) {
                            return <li key={article.slug}><span className="block py-2 pl-3 text-xs leading-relaxed text-muted">{article.title}</span></li>;
                          }
                          return (
                            <li key={article.slug}>
                              <Link
                                ref={isCurrent ? activeRef : undefined}
                                href={`/${article.slug}`}
                                aria-current={isCurrent ? 'page' : undefined}
                                className={`-ml-px block border-l-2 px-3 py-2 text-xs leading-relaxed transition-colors ${isCurrent ? 'border-accent bg-card font-medium text-body' : 'border-transparent text-muted hover:border-border-strong hover:text-body'}`}
                              >
                                <span className="mr-1.5 font-plex text-[10px] tabular-nums text-muted">{formatArticleNumber(article.number)}</span>
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
