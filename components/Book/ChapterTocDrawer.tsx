'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { List } from 'lucide-react';
import type { Book } from '@/lib/book-types';

const ChapterTocDrawerPanel = dynamic(
  () => import('@/components/Book/ChapterTocDrawerPanel').then(m => m.ChapterTocDrawerPanel),
  { ssr: false }
);

export interface ChapterTocDrawerProps {
  book: Book;
  /** Slug of the article currently being read; highlighted in the TOC. Omitted on non-article pages. */
  currentSlug?: string;
}

/**
 * Floating "Contents" pill anchored to the bottom-right of the viewport.
 * Click → right-side drawer slides in with the full Part → Chapter → Article
 * tree. Current article is highlighted. Esc / outside-click / clicking a
 * link closes the drawer.
 *
 * The pill itself is deliberately tiny (no framer-motion, no book-tree
 * render) so every article page pays for it — the drawer's contents
 * (ChapterTocDrawerPanel) are dynamic-imported only once actually opened.
 */
export function ChapterTocDrawer({ book, currentSlug = '' }: ChapterTocDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [everOpened, setEverOpened] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setEverOpened(true);
          setOpen(true);
        }}
        aria-label="Open table of contents"
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-body px-4 py-3 text-sm font-medium text-surface shadow-lg transition-colors hover:bg-subtle sm:right-6 lg:hidden"
      >
        <List size={18} strokeWidth={2.5} />
        <span>Contents</span>
      </button>

      {everOpened && (
        <ChapterTocDrawerPanel book={book} currentSlug={currentSlug} open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
