'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/hub/ThemeToggle';

const NAV = [
  { href: '/', label: 'Gallery' },
  { href: '/teaching', label: 'Teaching' },
  { href: '/research', label: 'Research' },
  { href: '/about', label: 'About' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Site-wide header for the hub surfaces. Editorial wordmark (Fraunces) on the
 * left, monospace nav on the right with an active-link rule. Sticky + blurred.
 */
export function HubHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-hub-line bg-hub-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-7">
        <Link href="/" className="group flex items-baseline gap-2.5 no-underline">
          <span className="font-serif text-[19px] font-semibold tracking-tight text-hub-ink">
            Vishal Singh
          </span>
          <span className="hidden font-plex text-[10.5px] uppercase tracking-[0.16em] text-hub-ink-faint sm:inline">
            NYU&nbsp;Stern
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <nav className="flex items-center gap-0.5 sm:gap-1.5">
            {NAV.map(item => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-2 py-1.5 font-plex text-[11.5px] uppercase tracking-[0.07em] transition-colors sm:px-2.5 sm:text-[12px] ${
                    active
                      ? 'bg-hub-teal-soft text-hub-teal'
                      : 'text-hub-ink-soft hover:bg-hub-paper2 hover:text-hub-ink'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
