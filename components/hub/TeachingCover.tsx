import Link from 'next/link';
import type { Book, Chapter } from '@/lib/book-types';
import { allArticles } from '@/lib/book-toc';
import { studios } from '@/lib/studios';

/**
 * The teaching-book cover page. Adapts the book-outline design language
 * (warm paper, Fraunces display, gradient Part banners, chapter cards) onto the
 * D3M Part -> Chapter -> Article structure. Each chapter card lists its
 * articles and surfaces any interactive studios paired to those articles.
 */

const PART_PILL_ACCENT = [
  'text-hub-teal',
  'text-hub-amber',
  'text-hub-plum',
  'text-hub-blue',
  'text-hub-teal',
  'text-hub-amber',
  'text-hub-plum',
];

function studiosForChapter(chapter: Chapter) {
  const slugs = new Set(chapter.articles.map(a => a.slug));
  return studios.filter(s => slugs.has(s.relatedSlug));
}

function MetaPill({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-hub-line bg-hub-card px-3.5 py-1.5 text-[12.5px] text-hub-ink-soft shadow-hub">
      <b className="font-semibold text-hub-ink">{value}</b> {label}
    </span>
  );
}

function ChapterCard({ chapter }: { chapter: Chapter }) {
  const related = studiosForChapter(chapter);
  return (
    <div className="flex flex-col rounded-2xl border border-hub-line bg-hub-card p-5 shadow-hub">
      <div className="font-plex text-[11px] uppercase tracking-[0.05em] text-hub-ink-faint">
        Chapter {chapter.number}
      </div>
      <h4 className="mt-1 font-serif text-[19px] font-semibold leading-snug text-hub-ink">
        {chapter.title}
      </h4>

      <ul className="mt-3 flex flex-col gap-0.5">
        {chapter.articles.map(a => (
          <li key={a.slug}>
            <Link
              href={`/${a.slug}`}
              className="group flex gap-2.5 rounded-md px-2 py-1.5 -mx-2 text-[13.5px] leading-snug text-hub-ink-soft transition-colors hover:bg-hub-paper2 hover:text-hub-ink"
            >
              <span className="font-plex text-[11.5px] text-hub-ink-faint pt-px tabular-nums">
                {a.number}
              </span>
              <span className="group-hover:underline decoration-hub-line-strong underline-offset-2">
                {a.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {related.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-hub-line pt-3">
          <span className="font-plex text-[10px] uppercase tracking-[0.06em] text-hub-ink-faint">
            Studios
          </span>
          {related.map(s => (
            <Link
              key={s.slug}
              href={`/studios/${s.slug}`}
              className="rounded-md border border-[#bcdcd8] bg-hub-teal-soft px-2 py-0.5 font-plex text-[10.5px] text-hub-teal transition-colors hover:border-hub-teal"
            >
              {s.title.length > 34 ? `${s.title.slice(0, 32)}…` : s.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeachingCover({ book }: { book: Book }) {
  const chapterCount = book.parts.reduce((n, p) => n + p.chapters.length, 0);

  return (
    <div>
      {/* Hero */}
      <header className="hub-hero border-b border-hub-line">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-7 sm:py-16">
          <div className="font-plex text-[12px] uppercase tracking-[0.16em] text-hub-amber">
            The Teaching Book · Interactive Edition
          </div>
          <h1 className="mt-3 max-w-4xl font-serif text-[clamp(34px,6vw,60px)] font-semibold leading-[1.08] tracking-tight text-hub-ink">
            {book.title}
          </h1>
          <p className="mt-3 max-w-2xl font-serif text-[clamp(18px,2.6vw,24px)] italic leading-snug text-hub-ink-soft">
            {book.subtitle}
          </p>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-hub-ink-soft">
            An expandable online book that moves from raw business questions to visual evidence,
            causal estimates, machine-learning models, and modern AI workflows — each chapter
            paired with real datasets and hands-on interactive studios.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <MetaPill value={`${book.parts.length} parts`} label="Part 0 → VI" />
            <MetaPill value={`${chapterCount} chapters`} label="gapless" />
            <MetaPill value={`${allArticles.length} articles`} label="published" />
            <MetaPill value={`${studios.length} studios`} label="interactive" />
          </div>
        </div>
      </header>

      {/* Parts + chapter cards */}
      <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-7">
        {book.parts.map((part, i) => (
          <section key={part.numeral} className="mt-12 first:mt-10">
            <div
              className={`hub-part-${i} relative overflow-hidden rounded-2xl border border-hub-line-strong px-6 py-6`}
            >
              <span className="absolute right-5 top-5 rounded-full border border-hub-line bg-hub-card px-3 py-1 font-plex text-[11.5px] text-hub-ink-faint">
                {part.chapters.length} {part.chapters.length === 1 ? 'chapter' : 'chapters'}
              </span>
              <div
                className={`font-plex text-[12px] uppercase tracking-[0.18em] ${PART_PILL_ACCENT[i] ?? 'text-hub-teal'}`}
              >
                Part {part.numeral}
              </div>
              <h3 className="mt-1.5 max-w-3xl font-serif text-[clamp(21px,3vw,29px)] font-semibold leading-tight text-hub-ink">
                {part.title}
              </h3>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {part.chapters.map(ch => (
                <ChapterCard key={ch.number} chapter={ch} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
