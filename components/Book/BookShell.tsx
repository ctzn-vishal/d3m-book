import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Article } from '@/lib/book-types';
import { book, findArticle, chapterHref } from '@/lib/book-toc';
import { getArticleDescription } from '@/lib/book-content';
import { ChapterTocDrawer } from '@/components/Book/ChapterTocDrawer';
import { BookSidebar } from '@/components/Book/BookSidebar';
import { OnThisPage } from '@/components/Book/OnThisPage';
import { ReadingProgress } from '@/components/Book/ReadingProgress';
import { KeyboardNav } from '@/components/Book/KeyboardNav';
import { CommandPalette } from '@/components/Book/CommandPalette';
import { BookTopBar } from '@/components/Book/BookTopBar';

export interface BookShellProps {
  slug: string;
  children: React.ReactNode;
}

function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

export function BookShell({ slug, children }: BookShellProps) {
  const found = findArticle(slug);
  if (!found) {
    throw new Error(`BookShell: no article found for slug "${slug}"`);
  }
  const { article, prev, next } = found;

  const part = book.parts.find(p =>
    p.chapters.some(c => c.articles.some(a => a.slug === slug))
  );
  const chapter = part?.chapters.find(c => c.articles.some(a => a.slug === slug));
  const description = getArticleDescription(slug);
  const articleIndex = chapter?.articles.findIndex(a => a.slug === slug) ?? -1;

  return (
    <div className="book-scope bg-surface text-body min-h-screen flex flex-col">
      <ReadingProgress key={slug} />
      <BookTopBar title={book.title} />

      <div className="mx-auto w-full max-w-[88rem] flex-1 px-5 sm:px-8 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[14rem_minmax(0,1fr)_11rem] xl:gap-12 xl:px-10">
        {/* Persistent chapter navigation — fixed-open on lg+ screens; below lg
            the floating ChapterTocDrawer takes over. */}
        <BookSidebar key={part?.numeral} book={book} currentSlug={slug} />

        {/* Content column (col2 of the grid). Marked as a size container so wide
            <Figure> zones can size against THIS column (via cqw units) and fill
            it — growing rightward into available space rather than sliding left
            under the sticky sidebar. */}
        <div id="book-content" tabIndex={-1} className="min-w-0 scroll-mt-24 outline-none [container-type:inline-size]">
          <div className="mx-auto w-full max-w-[44rem]">
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-8 text-xs leading-relaxed text-muted sm:pt-10" aria-label="Breadcrumb">
              <Link href="/teaching" className="hover:text-body">The book</Link>
              {part && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link href={`/teaching/part/${part.numeral}`} className="hover:text-body">Part {part.numeral}</Link>
                </>
              )}
              {chapter && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link href={chapterHref(chapter)} className="hover:text-body">Chapter {chapter.number}</Link>
                </>
              )}
            </nav>

            <article className="book-prose prose prose-brand mx-auto w-full min-w-0 max-w-none pb-8 pt-9 sm:pt-12">
              <header className="not-prose mb-10 border-b border-border pb-8 sm:mb-12 sm:pb-10">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <p className="book-kicker text-accent-ink">{formatArticleNumber(article.number)}</p>
                  {chapter && <p className="book-kicker text-muted">Article {articleIndex + 1} of {chapter.articles.length}</p>}
                </div>
                <h1 className="mt-5 font-serif text-[clamp(2.4rem,3.8vw,3.65rem)] font-normal leading-[1.08] tracking-[-0.04em] text-body">{article.title}</h1>
                {description && <p className="mt-5 text-base leading-relaxed text-subtle sm:text-lg">{description}</p>}
                <p className="mt-6 text-xs text-muted">Vishal Singh <span className="mx-2" aria-hidden="true">/</span> NYU Stern</p>
              </header>
              {children}
            </article>
            <BookFooter prev={prev} next={next} />
          </div>
        </div>

        {/* Right rail — in-page "On this page" TOC, sticky under the book bar. */}
        <aside className="hidden xl:block">
          <div className="sticky top-[4.5rem] max-h-[calc(100vh-4.5rem)] overflow-y-auto py-10 pr-1">
            <OnThisPage key={slug} />
            <Link href="/teaching" className="mt-8 block border-t border-border pt-5 text-xs text-muted transition-colors hover:text-body">← Explore the full book</Link>
          </div>
        </aside>
      </div>

      <ChapterTocDrawer book={book} currentSlug={slug} />
      <KeyboardNav
        prevSlug={prev ? prev.slug : null}
        nextSlug={next ? next.slug : null}
      />
      <CommandPalette book={book} />
    </div>
  );
}

function BookFooter({ prev, next }: { prev: Article | null; next: Article | null }) {
  return (
    <footer className="mt-8 border-t border-border pb-28 pt-8 sm:pb-14">
      <p className="book-kicker mb-5 text-muted">Continue reading</p>
      <nav aria-label="Article navigation" className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`/${prev.slug}`} className="group flex h-full flex-col border border-border p-5 transition-colors hover:border-border-strong hover:bg-card">
            <span className="book-kicker flex items-center gap-2 text-muted"><ArrowLeft size={13} aria-hidden="true" /> Previous</span>
            <span className="mt-4 text-xs text-muted">{formatArticleNumber(prev.number)}</span>
            <span className="mt-1 font-serif text-xl leading-snug text-body">{prev.title}</span>
          </Link>
        ) : <div className="hidden sm:block" />}
        {next && (
          <Link href={`/${next.slug}`} className="group flex h-full flex-col border border-border bg-card p-5 transition-colors hover:border-border-strong">
            <span className="book-kicker flex items-center justify-between gap-2 text-accent-ink">Up next <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
            <span className="mt-4 text-xs text-muted">{formatArticleNumber(next.number)}</span>
            <span className="mt-1 font-serif text-xl leading-snug text-body">{next.title}</span>
          </Link>
        )}
      </nav>
    </footer>
  );
}
