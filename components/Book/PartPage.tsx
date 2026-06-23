import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import type { Book, Part } from '@/lib/book-types';
import { getPartContent } from '@/lib/book-content';
import { resolveIcon, partColor } from '@/lib/book-visuals';
import { itemsForChapter } from '@/lib/registry';
import { BookFrame } from '@/components/Book/BookFrame';
import { ChapterCard } from '@/components/Book/ChapterCard';

interface PartPageProps {
  book: Book;
  part: Part;
  index: number;
  prev: Part | null;
  next: Part | null;
}

export function PartPage({ book, part, index, prev, next }: PartPageProps) {
  const content = getPartContent(part.numeral);
  const Icon = resolveIcon(content?.icon);
  const color = partColor(index);
  const chapterCount = part.chapters.length;
  const articleCount = part.chapters.reduce((n, c) => n + c.articles.length, 0);

  // Gallery items paired to any article in this part. These used to live on the
  // (now-removed) chapter overview page; surfaced here so the studios and data
  // stories tied to the part stay discoverable. Each item maps to a single
  // article slug, so aggregating across the part introduces no duplicates.
  const partSlugs = part.chapters.flatMap(c => c.articles.map(a => a.slug));
  const paired = itemsForChapter(partSlugs);
  const studios = paired.filter(i => i.type === 'Teaching');
  const dataStories = paired.filter(i => i.type === 'Blog');

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
            <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color.chip} ${color.icon}`}>
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
              <ChapterCard key={ch.number} chapter={ch} color={color} />
            ))}
          </div>
        </section>

        {/* Interactive studios paired with this part's chapters */}
        {studios.length > 0 && (
          <section className="mt-11">
            <h2 className="font-display text-lg font-semibold text-body">Interactive studios</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              Hands-on studios paired with this part&rsquo;s chapters — each opens in a new tab.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {studios.map(s => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                      {s.domain ?? s.topic ?? 'Studio'}
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                  <span className="mt-1.5 font-display text-[15.5px] font-semibold leading-snug text-body transition-colors group-hover:text-link">
                    {s.title}
                  </span>
                  <span className="mt-1 text-[13px] leading-relaxed text-muted">{s.description}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Featured data stories from the gallery */}
        {dataStories.length > 0 && (
          <section className="mt-11">
            <h2 className="font-display text-lg font-semibold text-body">Featured data stories</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              Interactive D3 pieces from the gallery that put this part&rsquo;s ideas to work — each opens in a new tab.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dataStories.map(story => (
                <a
                  key={story.id}
                  href={story.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface no-underline transition-colors hover:border-border-strong"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden bg-card">
                    {story.thumbnail ? (
                      <Image
                        src={story.thumbnail}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center font-display text-sm text-muted">
                        Data story
                      </span>
                    )}
                  </span>
                  <span className="flex flex-1 flex-col p-3.5">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                      {story.topic ?? 'Data story'}
                      <ArrowUpRight size={11} />
                    </span>
                    <span className="mt-1 font-display text-[14.5px] font-semibold leading-snug text-body transition-colors group-hover:text-link">
                      {story.title}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

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
