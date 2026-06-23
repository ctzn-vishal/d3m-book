import * as React from 'react';
import Link from 'next/link';
import type { Article, Book, ArticleLookup } from '@/lib/book-types';
import { chapterHref } from '@/lib/book-toc';
import { ChapterTocDrawer } from '@/components/Book/ChapterTocDrawer';
import { BookSidebar } from '@/components/Book/BookSidebar';
import { OnThisPage } from '@/components/Book/OnThisPage';
import { ReadingProgress } from '@/components/Book/ReadingProgress';
import { KeyboardNav } from '@/components/Book/KeyboardNav';
import { CommandPalette } from '@/components/Book/CommandPalette';
import { BookTopBar } from '@/components/Book/BookTopBar';

export interface BookShellProps {
  slug: string;
  book: Book;
  findArticle: (slug: string) => ArticleLookup;
  children: React.ReactNode;
}

function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

export function BookShell({ slug, book, findArticle, children }: BookShellProps) {
  const found = findArticle(slug);
  if (!found) {
    throw new Error(`BookShell: no article found for slug "${slug}"`);
  }
  const { article, prev, next } = found;

  const part = book.parts.find(p =>
    p.chapters.some(c => c.articles.some(a => a.slug === slug))
  );
  const chapter = part?.chapters.find(c => c.articles.some(a => a.slug === slug));

  return (
    <div className="bg-surface text-body min-h-screen flex flex-col">
      <ReadingProgress />
      <BookTopBar title={book.title} />

      <div className="mx-auto w-full max-w-[88rem] flex-1 px-5 sm:px-6 lg:px-8 xl:px-10 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[16rem_minmax(0,1fr)_13rem] xl:gap-10">
        {/* Persistent chapter navigation — fixed-open on lg+ screens; below lg
            the floating ChapterTocDrawer takes over. */}
        <BookSidebar book={book} currentSlug={slug} />

        {/* Content column (col2 of the grid). Marked as a size container so wide
            <Figure> zones can size against THIS column (via cqw units) and fill
            it — growing rightward into available space rather than sliding left
            under the sticky sidebar. */}
        <div className="min-w-0 [container-type:inline-size]">
        <div className="mx-auto w-full max-w-3xl lg:max-w-[44rem]">
          <nav className="pt-8 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/teaching" className="hover:text-link">
              {book.title}
            </Link>
            {part && (
              <>
                <span className="mx-2 text-subtle">/</span>
                <Link href={`/teaching/part/${part.numeral}`} className="hover:text-link">
                  Part {part.numeral}
                </Link>
              </>
            )}
            {chapter && (
              <>
                <span className="mx-2 text-subtle">/</span>
                <Link href={chapterHref(chapter)} className="text-subtle hover:text-link">
                  {chapter.title}
                </Link>
              </>
            )}
          </nav>

          <article className="mx-auto w-full min-w-0 py-10 prose prose-neutral prose-headings:font-display prose-headings:tracking-normal prose-h2:mt-12 prose-h2:text-[1.65rem] prose-h2:leading-tight prose-h3:mt-8 prose-h3:text-[1.2rem] prose-h3:leading-snug prose-p:leading-7 prose-li:leading-7">
            <header className="mb-9 not-prose">
              <p className="text-xs uppercase tracking-wider text-muted">
                {formatArticleNumber(article.number)}
              </p>
              <h1 className="mt-2 text-3xl font-display font-semibold leading-tight text-body sm:text-[2.35rem]">
                {article.title}
              </h1>
            </header>
            {children}
          </article>
        </div>
        </div>

        {/* Right rail — in-page "On this page" TOC, sticky under the book bar. */}
        <aside className="hidden xl:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto py-10 pr-1">
            <OnThisPage />
          </div>
        </aside>
      </div>

      <BookFooter prev={prev} next={next} />

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
    <footer className="mt-auto border-t border-border bg-card">
      <nav className="mx-auto flex max-w-3xl items-stretch gap-3 px-5 sm:px-6 py-7">
        <div className="flex-1">
          {prev && (
            <Link
              href={`/${prev.slug}`}
              className="block rounded-md border border-border bg-surface p-3.5 hover:border-border-strong transition-colors"
            >
              <p className="text-xs uppercase tracking-wider text-muted">
                ← Previous
              </p>
              <p className="mt-1 text-sm font-medium text-body">
                {formatArticleNumber(prev.number)} {prev.title}
              </p>
            </Link>
          )}
        </div>
        <div className="flex-1">
          {next && (
            <Link
              href={`/${next.slug}`}
              className="block rounded-md border border-border bg-surface p-3.5 text-right hover:border-border-strong transition-colors"
            >
              <p className="text-xs uppercase tracking-wider text-muted">
                Next →
              </p>
              <p className="mt-1 text-sm font-medium text-body">
                {formatArticleNumber(next.number)} {next.title}
              </p>
            </Link>
          )}
        </div>
      </nav>
    </footer>
  );
}
