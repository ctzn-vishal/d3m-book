import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Part } from '@/lib/book-types';
import { getPartContent } from '@/lib/book-content';
import { ACCENT, partAccent, resolveIcon } from '@/lib/book-visuals';
import { ChapterCard } from '@/components/hub/ChapterCard';

interface PartPageProps {
  part: Part;
  index: number;
  prev: Part | null;
  next: Part | null;
}

export function PartPage({ part, index, prev, next }: PartPageProps) {
  const content = getPartContent(part.numeral);
  const accent = partAccent(index);
  const a = ACCENT[accent];
  const Icon = resolveIcon(content?.icon);

  const chapterCount = part.chapters.length;
  const articleCount = part.chapters.reduce((n, c) => n + c.articles.length, 0);

  return (
    <div>
      {/* Hero banner — reuses the cover's per-part gradient for continuity. */}
      <header className={`hub-part-${index} border-b border-hub-line`}>
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-7 sm:py-16">
          <nav className="mb-7 flex items-center gap-2 font-plex text-[11px] uppercase tracking-[0.07em] text-hub-ink-faint">
            <Link href="/teaching" className="hover:text-hub-ink">
              The Teaching Book
            </Link>
            <span aria-hidden>/</span>
            <span className={a.text}>Part {part.numeral}</span>
          </nav>

          <div className="flex items-start gap-4 sm:gap-5">
            <span
              className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${a.borderSoft} bg-hub-card ${a.text} shadow-hub sm:h-16 sm:w-16`}
            >
              <Icon size={30} strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <div className={`font-plex text-[12px] uppercase tracking-[0.18em] ${a.text}`}>
                Part {part.numeral}
              </div>
              <h1 className="mt-1.5 font-serif text-[clamp(28px,5vw,44px)] font-semibold leading-[1.1] tracking-tight text-hub-ink">
                {part.title}
              </h1>
              {content?.tagline && (
                <p className="mt-2 font-serif text-[clamp(16px,2.2vw,21px)] italic leading-snug text-hub-ink-soft">
                  {content.tagline}
                </p>
              )}
            </div>
          </div>

          {content?.summary && (
            <p className="mt-6 max-w-3xl text-[16.5px] leading-relaxed text-hub-ink-soft">
              {content.summary}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2.5">
            <MetaPill value={`${chapterCount}`} label={chapterCount === 1 ? 'chapter' : 'chapters'} />
            <MetaPill value={`${articleCount}`} label="articles" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pb-20 sm:px-7">
        {/* What you'll learn */}
        {content?.whatYoullLearn && content.whatYoullLearn.length > 0 && (
          <section className="mt-12">
            <h2 className="font-plex text-[12px] uppercase tracking-[0.12em] text-hub-ink-faint">
              What you&rsquo;ll learn
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {content.whatYoullLearn.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-hub-line bg-hub-card p-4 shadow-hub"
                >
                  <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${a.softBg} ${a.text}`}>
                    <Check size={13} strokeWidth={2.75} />
                  </span>
                  <span className="text-[14px] leading-snug text-hub-ink-soft">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Chapters */}
        <section className="mt-12">
          <h2 className="font-plex text-[12px] uppercase tracking-[0.12em] text-hub-ink-faint">
            {chapterCount === 1 ? 'In this part' : `${chapterCount} chapters`}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {part.chapters.map(ch => (
              <ChapterCard key={ch.number} chapter={ch} accent={accent} />
            ))}
          </div>
        </section>

        {/* Prev / next part */}
        <nav className="mt-14 flex items-stretch gap-3 border-t border-hub-line pt-7">
          <div className="flex-1">
            {prev && (
              <Link
                href={`/teaching/part/${prev.numeral}`}
                className="group flex h-full flex-col rounded-xl border border-hub-line bg-hub-card p-4 no-underline shadow-hub transition-colors hover:border-hub-line-strong"
              >
                <span className="inline-flex items-center gap-1.5 font-plex text-[10.5px] uppercase tracking-[0.07em] text-hub-ink-faint">
                  <ArrowLeft size={12} /> Part {prev.numeral}
                </span>
                <span className="mt-1 font-serif text-[15px] font-semibold leading-snug text-hub-ink">
                  {prev.title}
                </span>
              </Link>
            )}
          </div>
          <div className="flex-1">
            {next && (
              <Link
                href={`/teaching/part/${next.numeral}`}
                className="group flex h-full flex-col items-end rounded-xl border border-hub-line bg-hub-card p-4 text-right no-underline shadow-hub transition-colors hover:border-hub-line-strong"
              >
                <span className="inline-flex items-center gap-1.5 font-plex text-[10.5px] uppercase tracking-[0.07em] text-hub-ink-faint">
                  Part {next.numeral} <ArrowRight size={12} />
                </span>
                <span className="mt-1 font-serif text-[15px] font-semibold leading-snug text-hub-ink">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}

function MetaPill({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hub-line bg-hub-card px-3.5 py-1.5 text-[12.5px] text-hub-ink-soft shadow-hub">
      <b className="font-semibold text-hub-ink">{value}</b> {label}
    </span>
  );
}
