import * as React from 'react';

/**
 * Lightweight citation system for the Part VI survey "D3M with AI Agents".
 *
 * Each article declares a single `sources` array at the top of its MDX:
 *
 *   export const sources = [
 *     { id: 'mcp-spec', title: '…', publisher: 'Anthropic', year: '2024', url: 'https://…' },
 *   ];
 *
 * Inline, a claim is cited with <Cite id="mcp-spec" sources={sources} /> (or an
 * array of ids). At the foot of the article, <SourceList sources={sources} />
 * renders the numbered list. Because <Cite> and <SourceList> read the SAME
 * array, the superscript number always matches the list entry and the anchor —
 * there is no manual numbering to keep in sync.
 *
 * No client JS: these are plain anchors, so citations work even before hydration.
 */

export type Source = {
  /** Stable, article-unique key referenced by <Cite>. */
  id: string;
  title: string;
  publisher: string;
  year: string | number;
  url: string;
};

/** Strip protocol + trailing slash for a compact printed URL. */
function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export interface CiteProps {
  /** One source id, or several for a grouped citation. */
  id: string | string[];
  sources: Source[];
}

/**
 * Inline superscript citation chip(s). Renders the 1-based index of each id in
 * the shared `sources` array, linking down to the matching SourceList entry.
 * Unknown ids are silently dropped so a typo degrades gracefully.
 */
export function Cite({ id, sources }: CiteProps) {
  const ids = Array.isArray(id) ? id : [id];
  const entries = ids
    .map(x => ({ id: x, n: sources.findIndex(s => s.id === x) + 1 }))
    .filter(e => e.n > 0);
  if (entries.length === 0) return null;
  return (
    <sup className="ml-px inline-flex translate-y-[-0.15em] gap-[2px] align-baseline text-[0.7em] font-semibold leading-none">
      {entries.map(e => (
        <a
          key={e.id}
          href={`#src-${e.id}`}
          className="rounded-[3px] bg-sky-50 px-[3px] py-px text-sky-700 no-underline ring-1 ring-inset ring-sky-100 transition-colors hover:bg-sky-100 hover:text-sky-900"
          aria-label={`Source ${e.n}`}
        >
          {e.n}
        </a>
      ))}
    </sup>
  );
}

export interface SourceListProps {
  sources: Source[];
  /** Section heading. Defaults to "Sources". */
  title?: string;
  /** Optional one-line note under the heading (e.g. "Verified June 2026"). */
  note?: React.ReactNode;
}

/**
 * The per-article numbered source list. Each entry carries an `id` anchor that
 * <Cite> links to; numbering is the array order, so it always matches the chips.
 */
export function SourceList({ sources, title = 'Sources', note }: SourceListProps) {
  if (!sources || sources.length === 0) return null;
  return (
    <section className="not-prose mt-14 border-t border-slate-200 pt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </h2>
        {note && <p className="text-[11px] text-slate-400">{note}</p>}
      </div>
      <ol className="mt-4 space-y-2.5">
        {sources.map((s, i) => (
          <li
            key={s.id}
            id={`src-${s.id}`}
            className="flex scroll-mt-24 gap-3 text-[13px] leading-snug"
          >
            <span className="select-none pt-px font-mono text-[11px] text-slate-400">
              {i + 1}
            </span>
            <span className="text-slate-600">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:text-sky-700 hover:decoration-sky-400"
              >
                {s.title}
              </a>
              <span className="text-slate-500">
                {' '}· {s.publisher}, {s.year}.
              </span>{' '}
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-[11px] text-slate-400 hover:text-sky-600"
              >
                {prettyUrl(s.url)}
              </a>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
