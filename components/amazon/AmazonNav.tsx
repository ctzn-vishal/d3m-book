'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LIVE_ANALYSES } from '@/lib/amazon';

/**
 * Sub-navigation across the Amazon surfaces. Sticks under the site header so
 * moving between the overview and an individual analysis feels like moving
 * inside one project rather than between unrelated pages.
 */
export function AmazonNav() {
  const pathname = usePathname();
  const items = [{ href: '/amazon', label: 'Overview' }].concat(
    LIVE_ANALYSES.map(a => ({ href: `/amazon/${a.slug}`, label: a.title }))
  );

  return (
    <nav
      aria-label="Amazon reviews analyses"
      className="sticky top-[57px] z-30 border-b border-hub-line bg-hub-paper/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-5 py-2 sm:px-7">
        <span className="mr-2 hidden shrink-0 font-plex text-[10.5px] uppercase tracking-[0.16em] text-hub-ink-faint sm:inline">
          Amazon reviews
        </span>
        {items.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 text-[13px] transition-colors ${
                active
                  ? 'bg-hub-teal-soft font-medium text-hub-teal'
                  : 'text-hub-ink-faint hover:bg-hub-paper2 hover:text-hub-ink'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
