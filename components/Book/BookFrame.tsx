import * as React from 'react';
import type { Book } from '@/lib/book-types';
import { BookTopBar } from '@/components/Book/BookTopBar';
import { CommandPalette } from '@/components/Book/CommandPalette';

/**
 * Wraps the non-article book surfaces (cover, part, chapter) in the same white
 * reading theme + sticky bar + ⌘K palette the article shell uses, so moving
 * between contents, a section, a chapter, and an article feels like one book.
 */
export function BookFrame({ book, children }: { book: Book; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-body">
      <BookTopBar title={book.title} />
      <div className="flex-1">{children}</div>
      <CommandPalette book={book} />
    </div>
  );
}
