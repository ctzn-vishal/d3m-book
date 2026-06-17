import * as React from 'react';
import Link from 'next/link';
import type { Article, Book, ArticleLookup } from '@/lib/book-types';
import { ChapterTocDrawer } from '@/components/Book/ChapterTocDrawer';
import { OnThisPage } from '@/components/Book/OnThisPage';
import { ReadingProgress } from '@/components/Book/ReadingProgress';
import { KeyboardNav } from '@/components/Book/KeyboardNav';
import { CommandPalette, SearchTrigger } from '@/components/Book/CommandPalette';

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
      <StickyBookBar book={book} />

      <div className="mx-auto w-full max-w-[88rem] flex-1 px-5 sm:px-6 lg:px-10 xl:grid xl:grid-cols-[minmax(8rem,1fr)_minmax(0,48rem)_13rem] xl:gap-9 2xl:grid-cols-[minmax(12rem,1fr)_minmax(0,48rem)_13rem]">
        {/* Left spacer — balances the right TOC rail so the prose column
            stays optically centered on wide screens. */}
        <div className="hidden xl:block" aria-hidden="true" />

        <div className="mx-auto w-full max-w-3xl xl:mx-0 xl:max-w-none">
          <nav className="pt-8 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/teaching" className="hover:text-link">
              {book.title}
            </Link>
            {part && (
              <>
                <span className="mx-2 text-subtle">/</span>
                <span>Part {part.numeral}</span>
              </>
            )}
            {chapter && (
              <>
                <span className="mx-2 text-subtle">/</span>
                <span className="text-subtle">{chapter.title}</span>
              </>
            )}
          </nav>

          <article className="w-full min-w-0 py-10 prose prose-neutral prose-headings:font-display prose-headings:tracking-normal prose-h2:mt-12 prose-h2:text-[1.65rem] prose-h2:leading-tight prose-h3:mt-8 prose-h3:text-[1.2rem] prose-h3:leading-snug prose-p:leading-7 prose-li:leading-7">
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

/**
 * Thin book bar that stays pinned to the top of the viewport while reading.
 * Carries the book title (→ home), a ⌘K search trigger, and a link to the
 * case-study gallery.
 */
function StickyBookBar({ book }: { book: Book }) {
  return (
    <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-5 sm:px-6 lg:px-10 py-2.5">
        <Link
          href="/teaching"
          className="text-sm font-display font-semibold text-body hover:text-link transition-colors truncate"
        >
          {book.title}
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <SearchTrigger />
          <Link
            href="/studios"
            className="hidden sm:inline-block rounded-md px-2.5 py-1.5 text-xs font-medium text-muted hover:text-body hover:bg-card transition-colors"
          >
            Case Gallery
          </Link>
        </div>
      </div>
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
