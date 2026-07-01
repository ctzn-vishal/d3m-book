import * as React from 'react';
import type { Book } from '@/lib/book-types';
import { BookTopBar } from '@/components/Book/BookTopBar';
import { BookSidebar } from '@/components/Book/BookSidebar';
import { ChapterTocDrawer } from '@/components/Book/ChapterTocDrawer';
import { CommandPalette } from '@/components/Book/CommandPalette';

export interface BookFrameProps {
  book: Book;
  /** Part to expand/highlight in the sidebar; part-landing pages have no current article. */
  activePartNumeral?: string;
  /** Rendered full-width, above the sidebar grid — e.g. the cover's full-bleed hero. */
  beforeContent?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Wraps the non-article book surfaces (cover, part) in the same white reading
 * theme, sticky bar, persistent contents sidebar, and ⌘K palette the article
 * shell uses, so moving between contents, a part, and an article feels like
 * one continuous book. Deliberately omits the article-only pieces of
 * BookShell (reading progress bar, "on this page" rail, prev/next article
 * footer, arrow-key nav) — neither the cover nor a part page has a single
 * linear article to track.
 */
export function BookFrame({ book, activePartNumeral, beforeContent, children }: BookFrameProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-body">
      <BookTopBar title={book.title} />
      {beforeContent}
      <div className="mx-auto w-full max-w-[88rem] flex-1 px-5 sm:px-6 lg:px-8 xl:px-10 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-10">
        <BookSidebar book={book} activePartNumeral={activePartNumeral} />
        <div className="min-w-0">{children}</div>
      </div>
      <ChapterTocDrawer book={book} />
      <CommandPalette book={book} />
    </div>
  );
}
