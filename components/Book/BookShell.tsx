import * as React from 'react';
import Link from 'next/link';
import type { Article, Book, ArticleLookup } from '@/lib/book-types';
import { ChapterTocDrawer } from '@/components/Book/ChapterTocDrawer';

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
      <StickyBookBar title={book.title} subtitle={book.subtitle} />

      <nav className="mx-auto max-w-3xl w-full px-6 pt-8 text-sm text-muted">
        <Link href="/" className="hover:text-link">
          {book.title}
        </Link>
        {part && (
          <>
            <span className="mx-2 text-subtle">/</span>
            <span>Part {part.numeral}: {part.title}</span>
          </>
        )}
        {chapter && (
          <>
            <span className="mx-2 text-subtle">/</span>
            <span>Chapter {chapter.number}</span>
          </>
        )}
      </nav>

      <article className="mx-auto max-w-3xl w-full px-6 py-10 prose prose-neutral">
        <header className="mb-10 not-prose">
          <p className="text-xs uppercase tracking-wider text-muted">
            {formatArticleNumber(article.number)}
          </p>
          <h1 className="mt-2 text-3xl font-display font-semibold text-body sm:text-4xl">
            {article.title}
          </h1>
        </header>
        {children}
      </article>

      {/* mt-auto pushes the prev/next nav to the bottom of the viewport
          on short articles, while still flowing naturally below the
          content on long ones. */}
      <BookFooter prev={prev} next={next} />

      <ChapterTocDrawer book={book} currentSlug={slug} />
    </div>
  );
}

/**
 * Thin book bar that stays pinned to the top of the viewport while reading.
 * Sits *under* the site header (z-index 30 vs site header's 50). When the
 * site header auto-hides on scroll-down, this bar slides up to the top edge
 * and remains visible — so readers always know which book they're in.
 */
function StickyBookBar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12 py-2.5">
        <Link
          href="/"
          className="text-sm font-display font-semibold text-body hover:text-link transition-colors"
        >
          {title}
        </Link>
        <span className="hidden sm:block text-xs text-muted">{subtitle}</span>
      </div>
    </div>
  );
}

function BookFooter({ prev, next }: { prev: Article | null; next: Article | null }) {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <nav className="mx-auto flex max-w-3xl items-stretch gap-4 px-6 py-8">
        <div className="flex-1">
          {prev && (
            <Link
              href={`/${prev.slug}`}
              className="block rounded-md border border-border p-4 hover:border-border-strong transition-colors"
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
              className="block rounded-md border border-border p-4 text-right hover:border-border-strong transition-colors"
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
