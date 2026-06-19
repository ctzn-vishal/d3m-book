import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen } from 'lucide-react';
import type { Book, Chapter, Part } from '@/lib/book-types';
import { getChapterContent, getArticleBlurb } from '@/lib/book-content';
import { resolveIcon, partColor } from '@/lib/book-visuals';
import { studiosForChapter } from '@/lib/book-studios';
import { BookFrame } from '@/components/Book/BookFrame';

interface ChapterPageProps {
  book: Book;
  chapter: Chapter;
  part: Part;
  partIndex: number;
  prev: { chapter: Chapter } | null;
  next: { chapter: Chapter } | null;
}

export function ChapterPage({ book, chapter, part, partIndex, prev, next }: ChapterPageProps) {
  const content = getChapterContent(chapter.number);
  const Icon = resolveIcon(content?.icon);
  const color = partColor(partIndex);
  const related = studiosForChapter(chapter);
  const firstArticle = chapter.articles[0];

  return (
    <BookFrame book={book}>
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/teaching" className="hover:text-link">
            Contents
          </Link>
          <span className="mx-2 text-subtle">/</span>
          <Link href={`/teaching/part/${part.numeral}`} className="hover:text-link">
            Part {part.numeral}
          </Link>
          <span className="mx-2 text-subtle">/</span>
          <span className="text-subtle">Chapter {chapter.number}</span>
        </nav>

        {/* Header */}
        <header className="mt-7 border-b border-border pb-8">
          <div className="flex items-start gap-4">
            <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color.chip} ${color.icon}`}>
              <Icon size={24} strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">
                Part {part.numeral} · Chapter {chapter.number}
              </p>
              <h1 className="mt-1.5 font-display text-[clamp(25px,4.2vw,38px)] font-semibold leading-[1.1] tracking-tight text-body">
                {chapter.title}
              </h1>
              {content?.throughLine && (
                <p className="mt-2.5 text-[16.5px] leading-snug text-muted">{content.throughLine}</p>
              )}
            </div>
          </div>

          {content?.summary && (
            <p className="mt-6 text-[16.5px] leading-relaxed text-subtle">{content.summary}</p>
          )}

          {firstArticle && (
            <div className="mt-7">
              <Link
                href={`/${firstArticle.slug}`}
                className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-link-hover"
              >
                <BookOpen size={15} strokeWidth={2} /> Start reading
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </header>

        {/* Topics covered */}
        {content?.topics && content.topics.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-body">Topics covered</h2>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {content.topics.map((topic, i) => (
                <span
                  key={i}
                  className="rounded-full border border-border bg-card px-3 py-1 text-[12.5px] text-subtle"
                >
                  {topic}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold text-body">In this chapter</h2>
          <ol className="mt-4 flex flex-col gap-2.5">
            {chapter.articles.map(art => {
              const blurb = getArticleBlurb(art.slug);
              return (
                <li key={art.slug}>
                  <Link
                    href={`/${art.slug}`}
                    className="group flex items-start gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong sm:p-5"
                  >
                    <span className="mt-0.5 inline-flex min-w-[2.75rem] items-center justify-center rounded-md bg-card px-2 py-1 font-mono text-[12.5px] font-medium tabular-nums text-muted">
                      {art.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="font-display text-[16.5px] font-semibold leading-snug text-body transition-colors group-hover:text-link">
                          {art.title}
                        </span>
                        <ArrowRight
                          size={15}
                          className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                      {blurb && <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">{blurb}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Paired studios */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-body">Interactive studios</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map(s => (
                <a
                  key={s.slug}
                  href={`/studios/${s.slug}/index.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                      {s.domain} · {s.kind === 'exercise' ? 'Hands-on' : 'Explore'}
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                  <span className="mt-1.5 font-display text-[15.5px] font-semibold leading-snug text-body transition-colors group-hover:text-link">
                    {s.title}
                  </span>
                  <span className="mt-1 text-[13px] leading-relaxed text-muted">{s.blurb}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Prev / next chapter */}
        <nav className="mt-14 flex items-stretch gap-3 border-t border-border pt-7">
          <div className="flex-1">
            {prev && (
              <Link
                href={`/teaching/ch/${prev.chapter.number}`}
                className="block rounded-md border border-border bg-surface p-3.5 transition-colors hover:border-border-strong"
              >
                <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                  <ArrowLeft size={12} /> Chapter {prev.chapter.number}
                </span>
                <span className="mt-1 block text-sm font-medium text-body">{prev.chapter.title}</span>
              </Link>
            )}
          </div>
          <div className="flex-1">
            {next && (
              <Link
                href={`/teaching/ch/${next.chapter.number}`}
                className="block rounded-md border border-border bg-surface p-3.5 text-right transition-colors hover:border-border-strong"
              >
                <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                  Chapter {next.chapter.number} <ArrowRight size={12} />
                </span>
                <span className="mt-1 block text-sm font-medium text-body">{next.chapter.title}</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </BookFrame>
  );
}
