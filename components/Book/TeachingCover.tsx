import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, LayoutGrid } from 'lucide-react';
import type { Book } from '@/lib/book-types';
import { allArticles } from '@/lib/book-toc';
import { studios } from '@/lib/studios';
import { getPartContent } from '@/lib/book-content';
import { resolveIcon, partColor } from '@/lib/book-visuals';
import { BookFrame } from '@/components/Book/BookFrame';

/**
 * The book's contents page. A full-width hero image carries the title, then the
 * book's table of contents is presented as "the arc of the book": one card per
 * part (in reading order, 0 → VI), each linking to its overview and listing its
 * chapters. Same white reading theme + chrome as the articles; each part carries
 * its own accent color.
 */

/** Per-part accent hex (matches the 600-shade in book-visuals PART_COLORS),
 *  used for inline-styled accents the Tailwind JIT can't see at build time. */
const PART_HEX = ['#0284c7', '#059669', '#7c3aed', '#ea580c', '#4f46e5', '#e11d48', '#0d9488'];

function partHex(i: number): string {
  return PART_HEX[i % PART_HEX.length];
}

export function TeachingCover({ book }: { book: Book }) {
  const chapterCount = book.parts.reduce((n, p) => n + p.chapters.length, 0);
  const firstSlug = book.parts[0]?.chapters[0]?.articles[0]?.slug ?? '';

  const stats = [
    { value: book.parts.length, label: 'parts' },
    { value: chapterCount, label: 'chapters' },
    { value: allArticles.length, label: 'articles' },
    { value: studios.length, label: 'studios' },
  ];

  return (
    <BookFrame book={book}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-slate-950">
        <Image src="/hero.webp" alt="" fill priority sizes="100vw" className="object-cover brightness-[1.08]" />
        {/* Light scrims so the collage stays visible; a drop-shadow on the text
            keeps the white type legible without a heavy overlay. */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-950/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl px-5 py-16 drop-shadow-[0_2px_16px_rgba(2,6,23,0.75)] sm:px-6 sm:py-24 lg:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
            An interactive textbook · Vishal Singh · NYU Stern
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(32px,5.5vw,54px)] font-semibold leading-[1.07] tracking-tight text-white">
            {book.title}
          </h1>
          <p className="mt-3 max-w-2xl font-display text-[clamp(17px,2.4vw,22px)] font-medium leading-snug text-white/90">
            {book.subtitle}
          </p>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-white/80">
            An expandable online book that moves from raw business questions to visual evidence,
            causal estimates, machine-learning models, and modern AI agents — each chapter paired
            with real datasets and hands-on interactive studios.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {firstSlug && (
              <Link
                href={`/${firstSlug}`}
                className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-950/30 transition-colors hover:bg-link-hover"
              >
                <BookOpen size={16} strokeWidth={2} /> Start reading
                <ArrowRight size={15} />
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <LayoutGrid size={15} strokeWidth={2} /> Browse the gallery
            </Link>
          </div>

          <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-white">
            {stats.map(s => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-semibold">
                  {s.value}
                  <span className="ml-1.5 align-baseline text-[12.5px] font-normal uppercase tracking-wider text-white/65">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── The arc of the book — card TOC ───────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">The arc of the book</p>
          <h2 className="mt-1.5 font-display text-[clamp(22px,3.2vw,30px)] font-semibold leading-tight text-body">
            From business questions to AI workflows
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Seven parts, each building on the last. Pick a part to see its chapters — or start at the
            beginning and follow the path end to end.
          </p>
        </div>

        <ol className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {book.parts.map((part, i) => {
            const content = getPartContent(part.numeral);
            const PartIcon = resolveIcon(content?.icon);
            const color = partColor(i);
            const hex = partHex(i);

            return (
              <li key={part.numeral} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md">
                <span aria-hidden className="h-1 w-full shrink-0" style={{ background: hex }} />

                <div className="flex flex-1 flex-col p-5">
                  <Link href={`/teaching/part/${part.numeral}`} className="flex items-start gap-3">
                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color.chip} ${color.icon} transition-transform duration-200 group-hover:scale-105`}>
                      <PartIcon size={20} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10.5px] uppercase tracking-wider text-muted">
                        Part {part.numeral} · {part.chapters.length} {part.chapters.length === 1 ? 'chapter' : 'chapters'}
                      </span>
                      <span className="mt-0.5 block font-display text-[16.5px] font-semibold leading-snug text-body transition-colors group-hover:text-link">
                        {part.title}
                      </span>
                    </span>
                  </Link>

                  {content?.tagline && (
                    <p className="mt-2.5 text-[13px] leading-snug text-muted">{content.tagline}</p>
                  )}

                  <ul className="mt-4 flex flex-1 flex-col gap-0.5 border-t border-border pt-3">
                    {part.chapters.map(ch => (
                      <li key={ch.number}>
                        <Link
                          href={`/teaching/ch/${ch.number}`}
                          className="-mx-2 flex items-baseline gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] leading-snug text-subtle transition-colors hover:bg-card hover:text-link"
                        >
                          <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
                            {String(ch.number).padStart(2, '0')}
                          </span>
                          <span>{ch.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/teaching/part/${part.numeral}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted transition-colors hover:text-link"
                  >
                    Explore Part {part.numeral}
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </BookFrame>
  );
}
