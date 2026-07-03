'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Book } from '@/lib/book-types';

function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

export interface ChapterTocDrawerPanelProps {
  book: Book;
  currentSlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The scrim + slide-in drawer (framer-motion + the full Part → Chapter →
 * Article tree) — split out from ChapterTocDrawer.tsx so it can be
 * next/dynamic-loaded only once the drawer is actually opened.
 * ChapterTocDrawer.tsx owns the always-visible floating trigger pill and
 * `open` state; this component is purely presentational.
 */
export function ChapterTocDrawerPanel({ book, currentSlug = '', open, onOpenChange }: ChapterTocDrawerPanelProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Table of contents"
            className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto border-l border-border bg-surface shadow-2xl sm:w-[400px]"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur px-6 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Contents</p>
                <p className="text-sm font-display font-semibold text-body mt-0.5">{book.title}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close table of contents"
                className="p-2 -mr-2 rounded-md text-muted hover:text-body hover:bg-card transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="px-6 py-6">
              <Link
                href="/"
                onClick={() => onOpenChange(false)}
                className="mb-6 flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm font-medium text-body transition-colors hover:border-border-strong hover:text-link"
              >
                <span>Case Study &amp; Dashboard Gallery</span>
                <span aria-hidden="true" className="text-link">→</span>
              </Link>
              <ol className="space-y-8">
                {book.parts.map(part => (
                  <li key={part.numeral}>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                      Part {part.numeral}
                    </p>
                    <h3 className="mt-1 font-display font-semibold text-body text-base leading-snug">
                      {part.title}
                    </h3>

                    <ol className="mt-3 space-y-4">
                      {part.chapters.map(chapter => (
                        <li key={chapter.number}>
                          <p className="text-xs font-medium text-subtle">
                            <span className="font-mono tabular-nums text-muted mr-2">
                              {String(chapter.number).padStart(2, '0')}
                            </span>
                            {chapter.title}
                          </p>
                          <ul className="mt-1.5 ml-7 space-y-1">
                            {chapter.articles.map(article => {
                              const isCurrent = article.slug === currentSlug;
                              const isLinkable = article.status === 'published' || isCurrent;
                              return (
                                <li key={article.slug} className="flex items-baseline gap-2">
                                  <span className="w-14 shrink-0 text-[11px] tabular-nums text-muted">
                                    {formatArticleNumber(article.number)}
                                  </span>
                                  {isLinkable ? (
                                    <Link
                                      href={`/${article.slug}`}
                                      onClick={() => onOpenChange(false)}
                                      className={[
                                        'text-sm leading-snug transition-colors',
                                        isCurrent
                                          ? 'text-body font-semibold border-l-2 border-link pl-2 -ml-2'
                                          : 'text-link hover:text-link-hover',
                                      ].join(' ')}
                                      aria-current={isCurrent ? 'page' : undefined}
                                    >
                                      {article.title}
                                    </Link>
                                  ) : (
                                    <span className="text-sm leading-snug text-muted inline-flex items-baseline gap-2">
                                      <span>{article.title}</span>
                                      <span className="rounded bg-card px-1.5 py-0 text-[9px] uppercase tracking-wider text-subtle font-mono">
                                        {article.status}
                                      </span>
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ol>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
