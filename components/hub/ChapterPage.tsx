import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen } from 'lucide-react';
import type { Chapter, Part } from '@/lib/book-types';
import { getChapterContent, getArticleBlurb } from '@/lib/book-content';
import { ACCENT, partAccent, resolveIcon } from '@/lib/book-visuals';
import { studiosForChapter } from '@/lib/book-studios';

interface ChapterPageProps {
  chapter: Chapter;
  part: Part;
  partIndex: number;
  prev: { chapter: Chapter } | null;
  next: { chapter: Chapter } | null;
}

export function ChapterPage({ chapter, part, partIndex, prev, next }: ChapterPageProps) {
  const content = getChapterContent(chapter.number);
  const accent = partAccent(partIndex);
  const a = ACCENT[accent];
  const Icon = resolveIcon(content?.icon);
  const related = studiosForChapter(chapter);
  const firstArticle = chapter.articles[0];

  return (
    <div>
      {/* Hero */}
      <header className={`hub-part-${partIndex} border-b border-hub-line`}>
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-7 sm:py-14">
          <nav className="mb-7 flex flex-wrap items-center gap-2 font-plex text-[11px] uppercase tracking-[0.07em] text-hub-ink-faint">
            <Link href="/teaching" className="hover:text-hub-ink">
              The Teaching Book
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/teaching/part/${part.numeral}`} className="hover:text-hub-ink">
              Part {part.numeral}
            </Link>
            <span aria-hidden>/</span>
            <span className={a.text}>Chapter {chapter.number}</span>
          </nav>

          <div className="flex items-start gap-4 sm:gap-5">
            <span
              className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${a.borderSoft} bg-hub-card ${a.text} shadow-hub sm:h-16 sm:w-16`}
            >
              <Icon size={30} strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <div className="font-plex text-[12px] uppercase tracking-[0.12em] text-hub-ink-faint">
                Part {part.numeral} · <span className={a.text}>Chapter {chapter.number}</span>
              </div>
              <h1 className="mt-1.5 font-serif text-[clamp(27px,4.6vw,42px)] font-semibold leading-[1.1] tracking-tight text-hub-ink">
                {chapter.title}
              </h1>
              {content?.throughLine && (
                <p className="mt-2.5 font-serif text-[clamp(15px,2.1vw,20px)] italic leading-snug text-hub-ink-soft">
                  {content.throughLine}
                </p>
              )}
            </div>
          </div>

          {content?.summary && (
            <p className="mt-6 max-w-3xl text-[16.5px] leading-relaxed text-hub-ink-soft">
              {content.summary}
            </p>
          )}

          {firstArticle && (
            <div className="mt-7">
              <Link
                href={`/${firstArticle.slug}`}
                className={`inline-flex items-center gap-2 rounded-full border ${a.border} ${a.softBg} px-4 py-2 font-plex text-[12px] uppercase tracking-[0.06em] ${a.text} no-underline transition-transform hover:-translate-y-0.5`}
              >
                <BookOpen size={14} strokeWidth={2} /> Start reading
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 pb-20 sm:px-7">
        {/* Topics covered */}
        {content?.topics && content.topics.length > 0 && (
          <section className="mt-11">
            <h2 className="font-plex text-[12px] uppercase tracking-[0.12em] text-hub-ink-faint">
              Topics covered
            </h2>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {content.topics.map((topic, i) => (
                <span
                  key={i}
                  className="rounded-full border border-hub-line bg-hub-card px-3 py-1.5 text-[12.5px] text-hub-ink-soft shadow-hub"
                >
                  {topic}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        <section className="mt-11">
          <h2 className="font-plex text-[12px] uppercase tracking-[0.12em] text-hub-ink-faint">
            In this chapter
          </h2>
          <ol className="mt-4 flex flex-col gap-2.5">
            {chapter.articles.map(art => {
              const blurb = getArticleBlurb(art.slug);
              return (
                <li key={art.slug}>
                  <Link
                    href={`/${art.slug}`}
                    className="group flex items-start gap-4 rounded-2xl border border-hub-line bg-hub-card p-4 no-underline shadow-hub transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-hub-line-strong sm:p-5"
                  >
                    <span
                      className={`mt-0.5 inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 ${a.softBg} ${a.text} font-plex text-[12.5px] font-semibold tabular-nums`}
                    >
                      {art.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="font-serif text-[17px] font-semibold leading-snug text-hub-ink decoration-hub-line-strong underline-offset-2 group-hover:underline">
                          {art.title}
                        </span>
                        <ArrowRight
                          size={15}
                          className="shrink-0 text-hub-ink-faint transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                      {blurb && (
                        <span className="mt-1 block text-[13.5px] leading-relaxed text-hub-ink-soft">
                          {blurb}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Paired studios */}
        {related.length > 0 && (
          <section className="mt-11">
            <h2 className="font-plex text-[12px] uppercase tracking-[0.12em] text-hub-ink-faint">
              Interactive studios
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map(s => (
                <a
                  key={s.slug}
                  href={`/studios/${s.slug}/index.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl border border-hub-line bg-hub-card p-4 no-underline shadow-hub transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-hub-line-strong"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={`font-plex text-[10.5px] uppercase tracking-[0.06em] ${a.text}`}>
                      {s.domain} · {s.kind === 'exercise' ? 'Hands-on' : 'Explore'}
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-hub-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                  <span className="mt-1.5 font-serif text-[16px] font-semibold leading-snug text-hub-ink">
                    {s.title}
                  </span>
                  <span className="mt-1 text-[13px] leading-relaxed text-hub-ink-soft">{s.blurb}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Prev / next chapter */}
        <nav className="mt-14 flex items-stretch gap-3 border-t border-hub-line pt-7">
          <div className="flex-1">
            {prev && (
              <Link
                href={`/teaching/ch/${prev.chapter.number}`}
                className="group flex h-full flex-col rounded-xl border border-hub-line bg-hub-card p-4 no-underline shadow-hub transition-colors hover:border-hub-line-strong"
              >
                <span className="inline-flex items-center gap-1.5 font-plex text-[10.5px] uppercase tracking-[0.07em] text-hub-ink-faint">
                  <ArrowLeft size={12} /> Chapter {prev.chapter.number}
                </span>
                <span className="mt-1 font-serif text-[15px] font-semibold leading-snug text-hub-ink">
                  {prev.chapter.title}
                </span>
              </Link>
            )}
          </div>
          <div className="flex-1">
            {next && (
              <Link
                href={`/teaching/ch/${next.chapter.number}`}
                className="group flex h-full flex-col items-end rounded-xl border border-hub-line bg-hub-card p-4 text-right no-underline shadow-hub transition-colors hover:border-hub-line-strong"
              >
                <span className="inline-flex items-center gap-1.5 font-plex text-[10.5px] uppercase tracking-[0.07em] text-hub-ink-faint">
                  Chapter {next.chapter.number} <ArrowRight size={12} />
                </span>
                <span className="mt-1 font-serif text-[15px] font-semibold leading-snug text-hub-ink">
                  {next.chapter.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
