import Link from 'next/link';
import { ArrowRight, BookOpen, LayoutGrid } from 'lucide-react';
import type { Book } from '@/lib/book-types';
import { allArticles } from '@/lib/book-toc';
import { studios } from '@/lib/studios';
import { getPartContent } from '@/lib/book-content';
import { resolveIcon, partColor } from '@/lib/book-visuals';
import { BookFrame } from '@/components/Book/BookFrame';
import { ChapterCard } from '@/components/Book/ChapterCard';

/**
 * The book's contents page. A light, editorial masthead (in the same white
 * reading theme + chrome as the articles — no warm hub palette) introduces the
 * book, followed by "the arc of the book": the seven parts as a connected
 * journey from raw business questions to AI workflows. Below, the full table of
 * contents reads like front matter — one ruled section per part, each with a
 * grid of chapter cards. Each part carries its own accent color.
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
      {/* ── Masthead ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        {/* Faint dotted-grid texture + a soft accent wash along the top edge —
            kept light and cheap so the page reads as the white book theme (not
            the warm hub gallery) and rasterizes without heavy blur passes. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.05) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: 'linear-gradient(180deg, rgba(14,165,233,0.06), transparent)' }}
        />

        <div className="relative mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20 lg:px-10">
          {/* Seven-part color spine — the journey, in miniature */}
          <div className="mb-7 flex items-center gap-1.5" aria-hidden>
            {book.parts.map((p, i) => (
              <span
                key={p.numeral}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: partHex(i), opacity: 0.85 }}
              />
            ))}
          </div>

          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            An interactive textbook · Vishal Singh · NYU Stern
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(34px,6vw,58px)] font-semibold leading-[1.05] tracking-tight text-body">
            {book.title}
          </h1>
          <p className="mt-4 max-w-2xl font-display text-[clamp(17px,2.4vw,23px)] font-medium leading-snug text-subtle">
            {book.subtitle}
          </p>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-muted">
            An expandable online book that moves from raw business questions to visual evidence,
            causal estimates, machine-learning models, and modern AI agents — each chapter paired
            with real datasets and hands-on interactive studios.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {firstSlug && (
              <Link
                href={`/${firstSlug}`}
                className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-link-hover"
              >
                <BookOpen size={16} strokeWidth={2} /> Start reading
                <ArrowRight size={15} />
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-subtle transition-colors hover:border-border-strong hover:text-link"
            >
              <LayoutGrid size={15} strokeWidth={2} /> Browse the gallery
            </Link>
          </div>

          {/* Stats */}
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {stats.map(s => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-semibold text-body">
                  {s.value}
                  <span className="ml-1.5 align-baseline text-[13px] font-normal uppercase tracking-wider text-muted">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── The arc of the book ──────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pt-12 sm:px-6 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">The arc of the book</p>
        <h2 className="mt-1.5 font-display text-[clamp(20px,3vw,28px)] font-semibold leading-tight text-body">
          From business questions to AI workflows
        </h2>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">
          Seven parts, each building on the last. Jump in anywhere — or follow the path end to end.
        </p>

        <div className="relative mt-8">
          {/* Connecting line — visible only on lg, where the parts sit in one row */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />
          <ol className="relative grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-4 lg:grid-cols-7">
            {book.parts.map((part, i) => {
              const content = getPartContent(part.numeral);
              const PartIcon = resolveIcon(content?.icon);
              const hex = partHex(i);
              return (
                <li key={part.numeral}>
                  <Link href={`/teaching/part/${part.numeral}`} className="group flex flex-col items-center text-center">
                    <span
                      className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border-2 bg-surface transition-transform duration-200 group-hover:-translate-y-0.5"
                      style={{ borderColor: hex }}
                    >
                      <PartIcon size={20} strokeWidth={1.8} style={{ color: hex }} />
                    </span>
                    <span className="mt-2.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                      Part {part.numeral}
                    </span>
                    <span className="mt-0.5 text-[12.5px] font-medium leading-snug text-subtle transition-colors group-hover:text-link">
                      {content?.tagline ?? part.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Full contents ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-6 lg:px-10">
        {book.parts.map((part, i) => {
          const content = getPartContent(part.numeral);
          const PartIcon = resolveIcon(content?.icon);
          const color = partColor(i);

          return (
            <section key={part.numeral} className="mt-14 scroll-mt-20 first:mt-12" id={`part-${part.numeral}`}>
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
