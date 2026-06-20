'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Book, Part } from '@/lib/book-types';

export interface BookHomeProps {
  book: Book;
  kicker?: string | null;
  attribution?: React.ReactNode | null;
}

const DEFAULT_KICKER = 'An executive MBA book on evidence, decisions, and AI workflows';

/**
 * Format an article number for display.
 *  - "2.2" → "§2.2"  (a sub-section of a multi-article chapter)
 *  - "13"  → "Ch. 13" (a single-article chapter; no section symbol)
 */
function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

const DEFAULT_ATTRIBUTION: React.ReactNode = (
  <>
    Built with the D3M book template, MDX articles, and reusable evidence components.
  </>
);

// Per-part subtle background tints. Cycles through six warm/cool washes
// so consecutive Parts feel distinct without clashing with brand.
const PART_TINTS = [
  'bg-gradient-to-b from-[#F5F0EB] via-[#FAF7F2] to-[#FFFFFF]',
  'bg-gradient-to-b from-[#EDF2F7] via-[#F4F8FC] to-[#FFFFFF]',
  'bg-gradient-to-b from-[#F4EDF2] via-[#FAF5F8] to-[#FFFFFF]',
  'bg-gradient-to-b from-[#EBF1ED] via-[#F4F8F5] to-[#FFFFFF]',
  'bg-gradient-to-b from-[#F2EFE8] via-[#F8F6F0] to-[#FFFFFF]',
  'bg-gradient-to-b from-[#EDEEF3] via-[#F5F6F9] to-[#FFFFFF]',
];

export function BookHome({ book, kicker = DEFAULT_KICKER, attribution = DEFAULT_ATTRIBUTION }: BookHomeProps) {
  const publishedCount = book.parts
    .flatMap(p => p.chapters)
    .flatMap(c => c.articles)
    .filter(a => a.status === 'published').length;
  const totalCount = book.parts
    .flatMap(p => p.chapters)
    .flatMap(c => c.articles).length;
  const broadChapterCount = book.parts.flatMap(p => p.chapters).length;

  return (
    <div className="bg-surface text-body">
      {/* Hero — asymmetric, big-type editorial cover */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF7F2] via-[#FFFFFF] to-[#EDF2F7] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12 py-24 lg:py-40 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8"
          >
            {kicker !== null && (
              <p className="text-xs uppercase tracking-[0.18em] text-muted mb-6">
                {kicker}
              </p>
            )}
            <h1 className="font-display font-semibold tracking-tight text-body leading-[0.95] text-5xl sm:text-6xl lg:text-8xl xl:text-9xl">
              {book.title}
            </h1>
            <p className="mt-8 text-lg lg:text-2xl text-subtle max-w-2xl leading-snug">
              {book.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 lg:text-right"
          >
            <div className="flex flex-col gap-4 lg:items-end">
              <div className="text-sm font-mono text-muted">
                <span className="text-body font-semibold tabular-nums">{publishedCount}</span>
                <span className="text-muted"> of </span>
                <span className="tabular-nums">{totalCount}</span>
                <span className="text-muted"> articles published</span>
              </div>
              <div className="text-xs text-muted max-w-xs lg:text-right">
                {book.parts.length} parts. {broadChapterCount} broad chapters. {totalCount} articles.
              </div>
              <Link
                href="/"
                className="mt-2 inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 hover:bg-link-hover transition-colors"
              >
                Interactive gallery
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Parts — each is a full-bleed band with a different tint */}
      {book.parts.map((part, i) => (
        <PartBand key={part.numeral} part={part} tintClass={PART_TINTS[i % PART_TINTS.length]} index={i} />
      ))}

      {attribution !== null && (
        <footer className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12 text-xs text-muted">
            {attribution}
          </div>
        </footer>
      )}
    </div>
  );
}

function PartBand({ part, tintClass, index }: { part: Part; tintClass: string; index: number }) {
  return (
    <section className={`relative ${tintClass} border-b border-border`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          {/* Part header — pinned left */}
          <header className="lg:col-span-4 lg:sticky lg:top-32">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Part {part.numeral}
            </p>
            <h2 className="mt-3 font-display font-semibold tracking-tight text-body text-3xl lg:text-5xl leading-[1.05]">
              {part.title}
            </h2>
          </header>

          {/* Chapter tiles — right column */}
          <div className="lg:col-span-8 space-y-8">
            {part.chapters.map((chapter, ci) => {
              // Collapse rendering when a chapter has only one article.
              // Convention from the TOC: single-article chapters use the
              // chapter title as the topic and the article title as a
              // (sometimes shortened) restatement — showing both is
              // redundant noise. The chapter heading itself becomes the
              // link, with the chapter title as the canonical wording.
              const onlyArticle = chapter.articles.length === 1 ? chapter.articles[0] : null;
              const isCollapsed = onlyArticle !== null;

              return (
                <motion.div
                  key={chapter.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: ci * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="border-t border-border/60 pt-6"
                >
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="font-mono text-sm tabular-nums text-muted shrink-0">
                      {String(chapter.number).padStart(2, '0')}
                    </span>
                    {isCollapsed && onlyArticle ? (
                      onlyArticle.status === 'published' ? (
                        <Link
                          href={`/${onlyArticle.slug}`}
                          className="font-display font-semibold text-body text-xl lg:text-2xl leading-tight hover:text-link transition-colors group inline-flex items-baseline gap-2"
                        >
                          <span>{chapter.title}</span>
                          <span className="text-link opacity-0 group-hover:opacity-100 transition-opacity text-base">→</span>
                        </Link>
                      ) : (
                        <h3 className="font-display font-semibold text-body text-xl lg:text-2xl leading-tight inline-flex items-baseline gap-3">
                          <span>{chapter.title}</span>
                          <span className="rounded bg-card px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-subtle font-mono">
                            {onlyArticle.status}
                          </span>
                        </h3>
                      )
                    ) : (
                      <h3 className="font-display font-semibold text-body text-xl lg:text-2xl leading-tight">
                        {chapter.title}
                      </h3>
                    )}
                  </div>

                  {!isCollapsed && (
                    <ul className="space-y-1.5 ml-9">
                      {chapter.articles.map(article => (
                        <li key={article.slug} className="flex items-baseline gap-3">
                          <span className="w-16 shrink-0 text-xs tabular-nums text-muted">
                            {formatArticleNumber(article.number)}
                          </span>
                          {article.status === 'published' ? (
                            <Link
                              href={`/${article.slug}`}
                              className="text-sm text-link hover:text-link-hover transition-colors group inline-flex items-baseline gap-2"
                            >
                              <span className="border-b border-transparent group-hover:border-link-hover transition-colors">
                                {article.title}
                              </span>
                              <span className="text-link-hover opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </Link>
                          ) : (
                            <span className="text-sm text-muted inline-flex items-baseline gap-2">
                              <span>{article.title}</span>
                              <span className="rounded bg-card px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-subtle font-mono">
                                {article.status}
                              </span>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default BookHome;
