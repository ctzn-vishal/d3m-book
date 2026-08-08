import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LIVE_ANALYSES } from '@/lib/amazon';

/**
 * Footer link to the next live analysis, wrapping around at the end. Keeps the
 * set navigable without a per-page hardcoded "next" that goes stale the moment
 * an analysis is inserted in the middle.
 */
export function NextAnalysis({ current }: { current: string }) {
  const i = LIVE_ANALYSES.findIndex(a => a.slug === current);
  const next = LIVE_ANALYSES[(i + 1) % LIVE_ANALYSES.length];
  if (!next || next.slug === current) return null;

  return (
    <div className="border-t border-hub-line bg-hub-paper2/60">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-7">
        <p className="font-plex text-[10.5px] uppercase tracking-[0.18em] text-hub-ink-faint">
          Next analysis
        </p>
        <Link href={`/amazon/${next.slug}`} className="group mt-2 block max-w-2xl">
          <h2 className="font-serif text-[22px] font-semibold leading-snug text-hub-ink transition-colors group-hover:text-hub-teal">
            {next.title}
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-hub-ink-soft">{next.blurb}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-hub-ink-faint transition-colors group-hover:text-hub-teal">
            Continue
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
