'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Search } from 'lucide-react';
import type { Book } from '@/lib/book-types';

const CommandPaletteModal = dynamic(
  () => import('@/components/Book/CommandPaletteModal').then(m => m.CommandPaletteModal),
  { ssr: false }
);

/**
 * Always-mounted trigger for the ⌘K search palette — deliberately tiny (no
 * framer-motion, no cmdk-style search index) so every article page pays for
 * it. The actual search UI (CommandPaletteModal) is dynamic-imported only
 * once the user actually opens the palette, via keyboard shortcut or the
 * SearchTrigger button.
 */
export function CommandPalette({ book }: { book: Book }) {
  const [open, setOpen] = React.useState(false);
  const [everOpened, setEverOpened] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setEverOpened(true);
        setOpen(o => !o);
      }
    };
    const onOpen = () => {
      setEverOpened(true);
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpen);
    };
  }, []);

  if (!everOpened) return null;
  return <CommandPaletteModal book={book} open={open} onOpenChange={setOpen} />;
}

/**
 * The ⌘K trigger shown in the sticky book bar. Lives here (a client module)
 * so the server-rendered BookShell can include it without becoming a client
 * component.
 */
export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-1.5 text-xs text-muted hover:text-body hover:border-border-strong transition-colors"
      aria-label="Search the book"
    >
      <Search size={13} strokeWidth={2.5} />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:inline font-mono text-[10px] text-subtle border border-border rounded px-1 py-0.5 leading-none">
        ⌘K
      </kbd>
    </button>
  );
}
