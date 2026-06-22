import Link from 'next/link';

/**
 * Site-wide footer for the hub surfaces. Quiet, paper-toned, with the section
 * links and an attribution line.
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
        <p className="mt-8 font-plex text-[11px] text-hub-ink-faint">
          © {year} Vishal Singh · vishalsingh.org
        </p>
      </div>
    </footer>
  );
}
