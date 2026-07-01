import Link from 'next/link';
import { SearchTrigger } from '@/components/Book/CommandPalette';
import { ThemeToggle } from '@/components/hub/ThemeToggle';

/**
 * The book's sticky top bar — shared by every reading surface (the cover, part
 * and chapter overviews, and each article via BookShell) so the chrome is
 * identical everywhere inside the book. Title returns to the contents; the
 * ⌘K search and the Gallery link sit on the right.
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
          <SearchTrigger />
          <ThemeToggle variant="book" />
          <Link
            href="/"
            className="hidden rounded-md px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card hover:text-body sm:inline-block"
          >
            Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
