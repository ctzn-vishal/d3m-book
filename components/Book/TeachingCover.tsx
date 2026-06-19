import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Book } from '@/lib/book-types';
import { allArticles } from '@/lib/book-toc';
import { studios } from '@/lib/studios';
import { getPartContent } from '@/lib/book-content';
import { resolveIcon } from '@/lib/book-visuals';
import { BookFrame } from '@/components/Book/BookFrame';
import { ChapterCard } from '@/components/Book/ChapterCard';

/**
 * The book's contents page. Reads like the front matter of the textbook: a
 * title block, then one ruled section per Part (linking to its overview) with a
 * grid of chapter cards. Same white reading theme + chrome as the articles.
 */
export function TeachingCover({ book }: { book: Book }) {
  const chapterCount = book.parts.reduce((n, p) => n + p.chapters.length, 0);
  const firstSlug = book.parts[0]?.chapters[0]?.articles[0]?.slug ?? '';

  return (
    <BookFrame book={book}>
      {/* Title block */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-16 lg:px-10">
          <p className="text-xs uppercase tracking-wider text-muted">An interactive textbook</p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(32px,5.5vw,52px)] font-semibold leading-[1.08] tracking-tight text-body">
            {book.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[clamp(17px,2.4vw,22px)] leading-snug text-muted">
            {book.subtitle}
          </p>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-subtle">
            An expandable online book that moves from raw business questions to visual evidence,
            causal estimates, machine-learning models, and modern AI workflows — each chapter
            paired with real datasets and hands-on interactive studios.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            <span><b className="font-semibold text-body">{book.parts.length}</b> parts</span>
            <span><b className="font-semibold text-body">{chapterCount}</b> chapters</span>
            <span><b className="font-semibold text-body">{allArticles.length}</b> articles</span>
            <span><b className="font-semibold text-body">{studios.length}</b> studios</span>
          </div>

          {firstSlug && (
            <div className="mt-8">
              <Link
                href={`/${firstSlug}`}
                className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-link-hover"
              >
                <BookOpen size={16} strokeWidth={2} /> Start reading
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Contents */}
      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-6 lg:px-10">
        {book.parts.map(part => {
          const content = getPartContent(part.numeral);
          const PartIcon = resolveIcon(content?.icon);

          return (
            <section key={part.numeral} className="mt-12 scroll-mt-20 first:mt-10" id={`part-${part.numeral}`}>
              <Link href={`/teaching/part/${part.numeral}`} className="group flex items-start gap-3 border-b border-border pb-4">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-card text-link">
                  <PartIcon size={20} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[11px] uppercase tracking-wider text-muted">
                    Part {part.numeral} · {part.chapters.length} {part.chapters.length === 1 ? 'chapter' : 'chapters'}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 font-display text-[clamp(20px,2.6vw,26px)] font-semibold leading-tight text-body transition-colors group-hover:text-link">
                    {part.title}
                    <ArrowRight
                      size={18}
                      className="hidden shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 sm:inline"
                    />
                  </span>
                  {content?.tagline && (
                    <span className="mt-1 block text-[14px] text-muted">{content.tagline}</span>
                  )}
                </span>
              </Link>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {part.chapters.map(ch => (
                  <ChapterCard key={ch.number} chapter={ch} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </BookFrame>
  );
}
