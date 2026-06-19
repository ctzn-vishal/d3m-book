import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, FlaskConical, Layers, Library, Sparkles } from 'lucide-react';
import type { Book } from '@/lib/book-types';
import { allArticles } from '@/lib/book-toc';
import { studios } from '@/lib/studios';
import { getPartContent } from '@/lib/book-content';
import { ACCENT, partAccent, resolveIcon } from '@/lib/book-visuals';
import { ChapterCard } from '@/components/hub/ChapterCard';

/**
 * The teaching-book cover. A warm-paper editorial overview of the whole book:
 * an enriched hero, then one accented, linked banner per Part, each opening a
 * grid of chapter cards. Part banners link to part overviews; chapter cards
 * link to chapter overviews; articles link to the articles themselves.
 */
export function TeachingCover({ book }: { book: Book }) {
  const chapterCount = book.parts.reduce((n, p) => n + p.chapters.length, 0);
  const firstSlug = book.parts[0]?.chapters[0]?.articles[0]?.slug ?? '';

  return (
    <div>
      {/* Hero */}
      <header className="hub-hero border-b border-hub-line">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-7 sm:py-16">
          <div className="inline-flex items-center gap-2 font-plex text-[12px] uppercase tracking-[0.16em] text-hub-amber">
            <Sparkles size={13} strokeWidth={2} />
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
            <StatPill icon={Layers} value={`${book.parts.length}`} label="parts · 0 → VI" />
            <StatPill icon={BookOpen} value={`${chapterCount}`} label="chapters" />
            <StatPill icon={Library} value={`${allArticles.length}`} label="articles" />
            <StatPill icon={FlaskConical} value={`${studios.length}`} label="studios" />
          </div>

          {firstSlug && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/${firstSlug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-hub-teal bg-hub-teal-soft px-5 py-2.5 font-plex text-[12.5px] uppercase tracking-[0.06em] text-hub-teal no-underline transition-transform hover:-translate-y-0.5"
              >
                <BookOpen size={15} strokeWidth={2} /> Start with the Foreword
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-hub-line bg-hub-card px-5 py-2.5 font-plex text-[12.5px] uppercase tracking-[0.06em] text-hub-ink-soft no-underline transition-colors hover:border-hub-line-strong hover:text-hub-ink"
              >
                Browse the gallery
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Parts + chapter cards */}
      <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-7">
        {book.parts.map((part, i) => {
          const accent = partAccent(i);
          const a = ACCENT[accent];
          const content = getPartContent(part.numeral);
          const PartIcon = resolveIcon(content?.icon);

          return (
            <section key={part.numeral} className="mt-12 scroll-mt-20 first:mt-10" id={`part-${part.numeral}`}>
              <Link
                href={`/teaching/part/${part.numeral}`}
                className={`hub-part-${i} group relative block overflow-hidden rounded-2xl border border-hub-line-strong px-6 py-6 no-underline`}
              >
                <span className="absolute right-5 top-5 hidden items-center gap-1.5 rounded-full border border-hub-line bg-hub-card px-3 py-1 font-plex text-[11.5px] text-hub-ink-faint sm:inline-flex">
                  {part.chapters.length} {part.chapters.length === 1 ? 'chapter' : 'chapters'}
                </span>

                <div className="flex items-start gap-4">
                  <span
                    className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${a.borderSoft} bg-hub-card ${a.text} shadow-hub`}
                  >
                    <PartIcon size={24} strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    <div className={`font-plex text-[12px] uppercase tracking-[0.18em] ${a.text}`}>
                      Part {part.numeral}
                    </div>
                    <h2 className="mt-1 max-w-3xl font-serif text-[clamp(21px,3vw,29px)] font-semibold leading-tight text-hub-ink decoration-hub-line-strong underline-offset-4 group-hover:underline">
                      {part.title}
                    </h2>
                    {content?.tagline && (
                      <p className="mt-1.5 font-serif text-[15.5px] italic leading-snug text-hub-ink-soft">
                        {content.tagline}
                      </p>
                    )}
                    <span
                      className={`mt-3 inline-flex items-center gap-1 font-plex text-[11px] uppercase tracking-[0.07em] ${a.text}`}
                    >
                      Explore Part {part.numeral}
                      <ArrowUpRight
                        size={13}
                        strokeWidth={2.25}
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {part.chapters.map(ch => (
                  <ChapterCard key={ch.number} chapter={ch} accent={accent} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-hub-line bg-hub-card px-3.5 py-1.5 text-[12.5px] text-hub-ink-soft shadow-hub">
      <Icon size={14} strokeWidth={1.9} className="text-hub-ink-faint" />
      <b className="font-semibold text-hub-ink">{value}</b> {label}
    </span>
  );
}
