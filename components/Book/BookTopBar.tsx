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
    <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-5 py-2.5 sm:px-6 lg:px-10">
        <Link
          href="/teaching"
          className="truncate text-sm font-display font-semibold text-body transition-colors hover:text-link"
        >
          {title}
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
