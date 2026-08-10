import * as React from 'react';
import { INK } from './types';

/**
 * Shared chrome for every /amazon surface. No 'use client' — these are pure
 * presentational wrappers, so they compose into both the server-rendered hub
 * and the client-rendered chart articles.
 */

/**
 * Plot's `style` option, themed to the hub scope.
 *
 * `overflow: visible` is required so axis labels aren't clipped — but it also
 * means a mark drawn outside the plot area will spill over the card and the
 * prose beneath it, silently, with no console error.
 *
 * The trap: `Plot.barY` on a truncated y-domain (say `[3.5, 4.4]`) draws from
 * y=0, which now maps far below the frame. Never put a bar on an axis that
 * doesn't start at zero — use a lollipop (`Plot.ruleX` from the domain floor
 * plus `Plot.dot` at the value). That is also the honest encoding, since a bar's
 * length is meaningless when measured from an arbitrary floor.
 */
export const plotStyle = {
  background: 'transparent',
  color: INK,
  fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
  fontSize: '11.5px',
  overflow: 'visible',
};

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-plex text-[10.5px] uppercase tracking-[0.18em] text-hub-ink-faint">
      {children}
    </p>
  );
}

export function Section({
  eyebrow,
  title,
  lede,
  id,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-hub-line py-12 first:border-0 first:pt-8">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2 max-w-3xl font-serif text-[clamp(22px,3vw,30px)] font-semibold leading-[1.15] tracking-tight text-hub-ink">
        {title}
      </h2>
      {lede && (
        <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-hub-ink-soft">{lede}</p>
      )}
      <div className="mt-7">{children}</div>
    </section>
  );
}

export function ChartCard({
  title,
  subtitle,
  controls,
  footnote,
  className = '',
  children,
}: {
  title: string;
  subtitle?: string;
  controls?: React.ReactNode;
  footnote?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={`rounded-xl border border-hub-line bg-hub-card p-4 shadow-hub sm:p-5 ${className}`}>
      <figcaption className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-serif text-[15px] font-semibold leading-snug text-hub-ink">{title}</h3>
          {subtitle && (
            <p className="mt-1 max-w-xl text-[12.5px] leading-snug text-hub-ink-faint">{subtitle}</p>
          )}
        </div>
        {controls}
      </figcaption>
      {children}
      {footnote && (
        <p className="mt-3 border-t border-hub-line pt-2.5 text-[12px] leading-snug text-hub-ink-faint">
          {footnote}
        </p>
      )}
    </figure>
  );
}

export function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-hub-ink-faint">
      {items.map(item => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

/** Interpretation and caveats — set apart from the descriptive prose. */
export function Aside({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 border-l-2 border-hub-amber bg-hub-amber-soft/40 py-3 pl-4 pr-3 text-[14.5px] leading-relaxed text-hub-ink-soft">
      {children}
    </div>
  );
}

/** A caveat the reader must not skip — used for the pooling warning. */
export function Warning({ label = 'Read this first.', children }: { label?: string; children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-lg border border-hub-amber/40 bg-hub-amber-soft/60 px-4 py-3 text-[14px] leading-relaxed text-hub-ink-soft">
      <span className="font-semibold text-hub-ink">{label} </span>
      {children}
    </p>
  );
}

export function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-hub-line">
      <p className="border-b border-hub-line bg-hub-paper2 px-4 py-2 font-plex text-[10.5px] uppercase tracking-wider text-hub-ink-faint">
        {label}
      </p>
      <pre className="overflow-x-auto bg-hub-paper2/60 px-4 py-3.5 font-plex text-[12px] leading-relaxed text-hub-ink-soft">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Headline figures. Label sits under the value but before it in the DOM. */
export function StatStrip({ stats }: { stats: Array<{ value: string; label: string }> }) {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-4">
      {stats.map(s => (
        <div key={s.label} className="flex flex-col-reverse">
          <dt className="mt-1.5 font-plex text-[10px] uppercase tracking-wider text-hub-ink-faint">
            {s.label}
          </dt>
          <dd className="font-serif text-[25px] font-semibold leading-none tracking-tight text-hub-ink tabular-nums">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Banner naming the slice an analysis is computed over. */
export function SourceNote({ source }: { source: string }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-hub-line bg-hub-paper2 px-3 py-1 font-plex text-[10.5px] uppercase tracking-wider text-hub-ink-faint">
      <span className="h-1.5 w-1.5 rounded-full bg-hub-teal" />
      {source}
    </p>
  );
}
