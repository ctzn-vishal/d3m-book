import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Book } from '@/lib/book-types';
import { allArticles } from '@/lib/book-toc';
import { studios } from '@/lib/studios';
import { getPartContent } from '@/lib/book-content';
import { resolveIcon, partColor } from '@/lib/book-visuals';
import { BookFrame } from '@/components/Book/BookFrame';
import { ChapterCard } from '@/components/Book/ChapterCard';

/**
 * The book's contents page. Opens with a hero band (an optimized data-viz
 * collage) carrying the title, then reads like the front matter of the
 * textbook: one ruled section per Part (linking to its overview) with a grid of
 * chapter cards. Same white reading theme + chrome as the articles; each part
 * carries its own icon color.
 */
export function TeachingCover({ book }: { book: Book }) {
  const chapterCount = book.parts.reduce((n, p) => n + p.chapters.length, 0);
  const firstSlug = book.parts[0]?.chapters[0]?.articles[0]?.slug ?? '';

  return (
    <BookFrame book={book}>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-slate-950">
        <Image src="/hero.webp" alt="" fill priority sizes="100vw" className="object-cover brightness-[1.08]" />
        {/* Light scrims so the collage — including its darker left — stays visible;
            a drop-shadow on the text keeps the white type legible without a heavy
            overlay. */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/18 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl px-5 py-16 drop-shadow-[0_2px_16px_rgba(2,6,23,0.75)] sm:px-6 sm:py-24 lg:px-10">
          <p className="text-xs uppercase tracking-wider text-white/65">An interactive textbook</p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(32px,5.5vw,54px)] font-semibold leading-[1.07] tracking-tight text-white">
            {book.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[clamp(17px,2.4vw,22px)] leading-snug text-white/85">
            {book.subtitle}
          </p>
          <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-white/75">
            An expandable online book that moves from raw business questions to visual evidence,
            causal estimates, machine-learning models, and modern AI workflows — each chapter
            paired with real datasets and hands-on interactive studios.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
            <span><b className="font-semibold text-white">{book.parts.length}</b> parts</span>
            <span><b className="font-semibold text-white">{chapterCount}</b> chapters</span>
            <span><b className="font-semibold text-white">{allArticles.length}</b> articles</span>
            <span><b className="font-semibold text-white">{studios.length}</b> studios</span>
          </div>

          {firstSlug && (
            <div className="mt-8">
              <Link
                href={`/${firstSlug}`}
                className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-950/30 transition-colors hover:bg-link-hover"
              >
                <BookOpen size={16} strokeWidth={2} /> Start reading
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Contents */}
      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-6 lg:px-10">
        {book.parts.map((part, i) => {
          const content = getPartContent(part.numeral);
          const PartIcon = resolveIcon(content?.icon);
          const color = partColor(i);

          return (
            <section key={part.numeral} className="mt-12 scroll-mt-20 first:mt-10" id={`part-${part.numeral}`}>
              <Link href={`/teaching/part/${part.numeral}`} className="group flex items-start gap-3 border-b border-border pb-4">
                <span className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${color.chip} ${color.icon}`}>
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
                  <ChapterCard key={ch.number} chapter={ch} color={color} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </BookFrame>
  );
}
