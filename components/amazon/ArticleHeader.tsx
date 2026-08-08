import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import type { Analysis } from '@/lib/amazon';
import { SourceNote } from './ui';

/** Masthead shared by every /amazon/<slug> analysis page. */
export function ArticleHeader({ analysis, standfirst }: { analysis: Analysis; standfirst: string }) {
  return (
    <header className="border-b border-hub-line bg-hub-paper2/60">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-7 sm:py-14">
        <Link
          href="/amazon"
          className="inline-flex items-center gap-1.5 font-plex text-[10.5px] uppercase tracking-[0.16em] text-hub-ink-faint transition-colors hover:text-hub-teal"
        >
          <ArrowLeft size={12} strokeWidth={2} /> Amazon reviews
        </Link>

        <h1 className="mt-4 max-w-3xl font-serif text-[clamp(27px,4.4vw,42px)] font-semibold leading-[1.08] tracking-tight text-hub-ink">
          {analysis.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-hub-ink-soft">{standfirst}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <SourceNote source={analysis.source} />
          <span className="inline-flex items-center gap-1.5 font-plex text-[10.5px] uppercase tracking-wider text-hub-ink-faint">
            <Clock size={11} strokeWidth={2} />
            {analysis.minutes} min
          </span>
          <span className="font-plex text-[10.5px] uppercase tracking-wider text-hub-ink-faint">
            Updated{' '}
            {new Date(`${analysis.updated}T00:00:00Z`).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </span>
        </div>
      </div>
    </header>
  );
}
