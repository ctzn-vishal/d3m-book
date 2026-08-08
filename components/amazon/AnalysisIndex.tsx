import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { ANALYSES } from '@/lib/amazon';
import { Eyebrow } from './ui';

/**
 * The index of analyses built on this corpus. Reads lib/amazon.ts, so adding an
 * analysis never means editing this file.
 *
 * `planned` entries render as dimmed, unlinked cards on purpose — an empty
 * roadmap slot is more honest than a page that does not exist yet, and it tells
 * a returning reader what is coming.
 */
export function AnalysisIndex() {
  return (
    <section id="analyses" className="scroll-mt-24 border-t border-hub-line py-12">
      <Eyebrow>Analyses</Eyebrow>
      <h2 className="mt-2 max-w-3xl font-serif text-[clamp(22px,3vw,30px)] font-semibold leading-[1.15] tracking-tight text-hub-ink">
        Questions asked of this corpus
      </h2>
      <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-hub-ink-soft">
        Each analysis states what slice it is computed over. The aggregate pages cover all
        507.7M reviews; others work from smaller samples where the review text itself is needed.
      </p>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {ANALYSES.map(a => {
          const planned = a.status === 'planned';
          const body = (
            <>
              <div className="flex items-center gap-2">
                <span className="font-plex text-[10px] uppercase tracking-wider text-hub-teal">
                  {a.source}
                </span>
                {planned && (
                  <span className="rounded-full border border-hub-line px-1.5 py-0.5 font-plex text-[9.5px] uppercase tracking-wider text-hub-ink-faint">
                    Planned
                  </span>
                )}
              </div>
              <h3
                className={`mt-2.5 font-serif text-[18px] font-semibold leading-snug ${
                  planned ? 'text-hub-ink-soft' : 'text-hub-ink group-hover:text-hub-teal'
                } transition-colors`}
              >
                {a.title}
              </h3>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-hub-ink-soft">{a.blurb}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="flex flex-wrap gap-1.5">
                  {a.tags.map(t => (
                    <span
                      key={t}
                      className="rounded-full bg-hub-paper2 px-2 py-0.5 font-plex text-[10px] text-hub-ink-faint"
                    >
                      {t}
                    </span>
                  ))}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 font-plex text-[10.5px] text-hub-ink-faint">
                  <Clock size={11} strokeWidth={2} />
                  {a.minutes} min
                </span>
              </div>
              {!planned && (
                <span className="mt-3 inline-flex items-center gap-1.5 border-t border-hub-line pt-3 text-[12.5px] font-medium text-hub-ink-faint transition-colors group-hover:text-hub-teal">
                  Read the analysis
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </>
          );

          return (
            <li key={a.slug}>
              {planned ? (
                <div className="flex h-full flex-col rounded-2xl border border-dashed border-hub-line bg-hub-paper2/40 p-5">
                  {body}
                </div>
              ) : (
                <Link
                  href={`/amazon/${a.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-hub-line bg-hub-card p-5 shadow-hub transition-all duration-200 hover:-translate-y-0.5 hover:border-hub-line-strong"
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
