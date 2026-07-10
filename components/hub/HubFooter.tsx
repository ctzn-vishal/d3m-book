import Link from 'next/link';
import { TOPICS, TOPIC_META } from '@/lib/taxonomy';

/**
 * Site-wide footer for the hub surfaces. Quiet, paper-toned, with the section
 * links, a browse-by-topic row (site-wide internal links into the /topic pages),
 * and an attribution line.
 */
export function HubFooter() {
  const year = 2026;
  return (
    <footer className="border-t border-hub-line">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 font-plex text-[12px] uppercase tracking-[0.08em] text-hub-ink-soft">
            <Link href="/gallery" className="hover:text-hub-teal">Gallery</Link>
            <Link href="/teaching" className="hover:text-hub-teal">Teaching</Link>
            <Link href="/research" className="hover:text-hub-teal">Research</Link>
            <Link href="/about" className="hover:text-hub-teal">About</Link>
          </nav>
        </div>
        <nav
          aria-label="Browse by topic"
          className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-hub-line pt-5 font-plex text-[11px] text-hub-ink-faint"
        >
          {TOPICS.map(t => (
            <Link key={t} href={`/topic/${TOPIC_META[t].slug}`} className="hover:text-hub-teal">
              {t}
            </Link>
          ))}
        </nav>
        <p className="mt-8 font-plex text-[11px] text-hub-ink-faint">
          © {year} Vishal Singh · vishalsingh.org
        </p>
      </div>
    </footer>
  );
}
