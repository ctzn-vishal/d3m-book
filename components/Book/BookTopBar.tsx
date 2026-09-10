import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { SearchTrigger } from '@/components/Book/CommandPalette';
import { ThemeToggle } from '@/components/hub/ThemeToggle';

/**
 * The book's sticky top bar — shared by every reading surface (the cover, part
 * and chapter overviews, and each article via BookShell) so the chrome is
 * identical everywhere inside the book. Title returns to the contents; ⌘K
 * search, the theme toggle, and the way back to the gallery sit on the right.
 *
 * Deliberately does NOT reuse HubHeader — the book stays on its own white
 * reading theme, not the hub's warm editorial one (see feedback memory on
 * teaching/book chrome). The Gallery link is styled as a bordered pill (same
 * visual weight as the search trigger) and never hidden on mobile, so there's
 * always an unmistakable way back to the site's home/gallery — previously it
 * was a small muted text link hidden below the sm: breakpoint.
 */
export function BookTopBar({ title }: { title: string }) {
  return (
    <div className="book-topbar sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
      <a href="#book-content" className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-3 focus:z-50 focus:bg-surface focus:p-3">Skip to content</a>
      <div className="mx-auto flex h-[4.5rem] max-w-[88rem] items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
        <Link
          href="/teaching"
          aria-label={`${title} — contents`}
          className="flex min-w-0 items-center gap-3 text-body transition-colors hover:text-accent-ink"
        >
          <span className="border-r border-border pr-3 font-serif text-2xl font-medium tracking-tight">D3M<span className="text-accent-ink">.</span></span>
          <span className="hidden truncate text-xs font-medium sm:block">{title}</span>
          <span className="text-xs text-muted sm:hidden">The book</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            aria-label="Go to the gallery"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-1.5 text-xs text-muted transition-colors hover:border-border-strong hover:text-body"
          >
            <LayoutGrid size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">Gallery</span>
          </Link>
          <SearchTrigger />
          <ThemeToggle variant="book" />
        </div>
      </div>
    </div>
  );
}
