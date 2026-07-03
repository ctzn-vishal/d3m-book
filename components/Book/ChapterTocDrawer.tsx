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
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-brand-primary/35 active:scale-95 sm:right-6 sm:px-4 lg:hidden book-toc-pill-pulse"
      >
        <List size={18} strokeWidth={2.5} />
        <span className="hidden sm:inline">Contents</span>
      </button>

      {everOpened && (
        <ChapterTocDrawerPanel book={book} currentSlug={currentSlug} open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
