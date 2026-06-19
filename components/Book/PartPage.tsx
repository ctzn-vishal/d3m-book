import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Book, Part } from '@/lib/book-types';
import { getPartContent } from '@/lib/book-content';
import { resolveIcon } from '@/lib/book-visuals';
import { BookFrame } from '@/components/Book/BookFrame';
import { ChapterCard } from '@/components/Book/ChapterCard';

interface PartPageProps {
  book: Book;
  part: Part;
  index: number;
  prev: Part | null;
  next: Part | null;
}

export function PartPage({ book, part, prev, next }: PartPageProps) {
  const content = getPartContent(part.numeral);
  const Icon = resolveIcon(content?.icon);
  const chapterCount = part.chapters.length;
  const articleCount = part.chapters.reduce((n, c) => n + c.articles.length, 0);

  return (
    <BookFrame book={book}>
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/teaching" className="hover:text-link">
            Contents
          </Link>
          <span className="mx-2 text-subtle">/</span>
          <span className="text-subtle">Part {part.numeral}</span>
        </nav>

        {/* Header */}
        <header className="mt-7 border-b border-border pb-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-card text-link">
              <Icon size={24} strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">Part {part.numeral}</p>
              <h1 className="mt-1.5 font-display text-[clamp(26px,4.5vw,40px)] font-semibold leading-[1.1] tracking-tight text-body">
                {part.title}
              </h1>
              {content?.tagline && <p className="mt-2 text-[17px] leading-snug text-muted">{content.tagline}</p>}
            </div>
          </div>

          {content?.summary && (
            <p className="mt-6 text-[16.5px] leading-relaxed text-subtle">{content.summary}</p>
          )}

          <p className="mt-5 font-mono text-xs uppercase tracking-wider text-muted">
            {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'} · {articleCount} articles
          </p>
        </header>

        {/* What you'll learn */}
        {content?.whatYoullLearn && content.whatYoullLearn.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-body">What you&rsquo;ll learn</h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {content.whatYoullLearn.map((item, i) => (
                <li key={i} className="flex gap-2.5">
                  <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-link" />
                  <span className="text-[14.5px] leading-snug text-subtle">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Chapters */}
        <section className="mt-11">
          <h2 className="font-display text-lg font-semibold text-body">
            {chapterCount === 1 ? 'In this part' : `Chapters in this part`}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {part.chapters.map(ch => (
              <ChapterCard key={ch.number} chapter={ch} />
            ))}
          </div>
        </section>

        {/* Prev / next part */}
        <PartNav prev={prev} next={next} />
      </div>
    </BookFrame>
  );
}

function PartNav({ prev, next }: { prev: Part | null; next: Part | null }) {
  return (
    <nav className="mt-14 flex items-stretch gap-3 border-t border-border pt-7">
      <div className="flex-1">
        {prev && (
          <Link
            href={`/teaching/part/${prev.numeral}`}
            className="block rounded-md border border-border bg-surface p-3.5 transition-colors hover:border-border-strong"
          >
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
              <ArrowLeft size={12} /> Part {prev.numeral}
            </span>
            <span className="mt-1 block text-sm font-medium text-body">{prev.title}</span>
          </Link>
        )}
      </div>
      <div className="flex-1">
        {next && (
          <Link
            href={`/teaching/part/${next.numeral}`}
            className="block rounded-md border border-border bg-surface p-3.5 text-right transition-colors hover:border-border-strong"
          >
            <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
              Part {next.numeral} <ArrowRight size={12} />
            </span>
            <span className="mt-1 block text-sm font-medium text-body">{next.title}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
