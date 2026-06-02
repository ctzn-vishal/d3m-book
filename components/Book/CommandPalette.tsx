'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { Book } from '@/lib/book-types';

interface Entry {
  href: string;
  title: string;
  /** Secondary line shown under the title (part / chapter context). */
  context: string;
  /** Lowercased haystack for matching. */
  haystack: string;
  kind: 'article' | 'page';
}

function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

function buildIndex(book: Book): Entry[] {
  const entries: Entry[] = [];
  entries.push({
    href: '/studios',
    title: 'Case Study & Dashboard Gallery',
    context: 'Interactive studios',
    haystack: 'case study dashboard gallery interactive studios',
    kind: 'page',
  });
  for (const part of book.parts) {
    for (const chapter of part.chapters) {
      for (const a of chapter.articles) {
        if (a.status !== 'published') continue;
        const num = formatArticleNumber(a.number);
        entries.push({
          href: `/${a.slug}`,
          title: a.title,
          context: `${num} · Part ${part.numeral} · ${chapter.title}`,
          haystack: `${num} ${a.title} ${chapter.title} ${part.title}`.toLowerCase(),
          kind: 'article',
        });
      }
    }
  }
  return entries;
}

export function CommandPalette({ book }: { book: Book }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const index = React.useMemo(() => buildIndex(book), [book]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 8);
    const terms = q.split(/\s+/);
    return index
      .filter(e => terms.every(t => e.haystack.includes(t)))
      .slice(0, 12);
  }, [index, query]);

  // Open via ⌘K / Ctrl-K, or the SearchTrigger's window event.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpen);
    };
  }, []);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // focus after the modal mounts
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(t);
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  React.useEffect(() => {
    setActive(0);
  }, [query]);

  const go = (e: Entry) => {
    setOpen(false);
    router.push(e.href);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) go(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  React.useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmdk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 backdrop-blur-[2px] p-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Search the book"
            className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search size={16} className="text-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search chapters, sections, studios…"
                className="w-full bg-transparent py-3.5 text-sm text-body outline-none placeholder:text-muted"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="p-1 text-muted hover:text-body"
              >
                <X size={16} />
              </button>
            </div>

            <ul ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted">
                  No matches for “{query}”.
                </li>
              )}
              {results.map((e, i) => (
                <li key={e.href}>
                  <button
                    type="button"
                    data-active={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(e)}
                    className={[
                      'flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors',
                      i === active ? 'bg-brand-primary/10' : 'hover:bg-card',
                    ].join(' ')}
                  >
                    <span className="text-sm font-medium text-body">{e.title}</span>
                    <span className="text-xs text-muted">{e.context}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted">
              <span>
                <kbd className="font-mono">↑↓</kbd> navigate · <kbd className="font-mono">↵</kbd> open · <kbd className="font-mono">esc</kbd> close
              </span>
              <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
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
