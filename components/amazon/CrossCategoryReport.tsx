'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChartCard, Aside, Section, Section as S, plotStyle } from './ui';
import { ACCENT, GRID, MUTED, compact, int, pct } from './types';
import type { CrossCategory } from './phase2-types';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/**
 * /amazon/cross-category — what a reviewer touches beyond one shelf.
 *
 * This is the only place the corpus can speak about substitution and adjacency,
 * because it is the only place reviewers are followed across categories.
 */
export function CrossCategoryReport({ data }: { data: CrossCategory }) {
  return (
    <>
      <HowManyShelves data={data} />
      <WhoStaysPut data={data} />
      <WhichShelvesShareReaders data={data} />
    </>
  );
}

// ── §1 Breadth ─────────────────────────────────────────────────────────────

function HowManyShelves({ data }: { data: CrossCategory }) {
  const b = data.breadth;
  const users = b.reduce((s, x) => s + x.users, 0);
  const reviews = b.reduce((s, x) => s + x.reviews, 0);
  const one = b.find(x => x.k === 1)!;
  const many = b.filter(x => x.k >= 10);
  const manyUsers = many.reduce((s, x) => s + x.users, 0);
  const manyReviews = many.reduce((s, x) => s + x.reviews, 0);

  const rows = b.map(x => ({
    ...x,
    userShare: (100 * x.users) / users,
    reviewShare: (100 * x.reviews) / reviews,
  }));

  return (
    <Section
      eyebrow="Breadth"
      title="Most reviewers never leave one category"
      lede={
        <>
          {pct((100 * one.users) / users)} of reviewers only ever reviewed in a single category, and
          they account for {pct((100 * one.reviews) / reviews)} of reviews. At the other end, the{' '}
          {pct((100 * manyUsers) / users)} who touched ten or more categories produced{' '}
          {pct((100 * manyReviews) / reviews)} of everything. Breadth and volume are the same trait
          seen twice.
        </>
      }
    >
      <ChartCard
        title="Reviewers and reviews by number of categories touched"
        subtitle="Log y-axis: the distribution spans seven orders of magnitude."
      >
        <PlotFigure
          ariaLabel="Bar chart of reviewers and reviews by category breadth."
          options={width =>
            ({
              width,
              height: 300,
              marginLeft: 60,
              marginBottom: 44,
              marginRight: 14,
              style: plotStyle,
              x: { label: 'Categories this reviewer touched →', grid: true },
              y: { label: '↑ Count (log)', grid: true, type: 'log', tickFormat: (d: number) => compact(d) },
              color: { domain: ['reviewers', 'reviews'], range: [ACCENT.blue, ACCENT.amber], legend: true },
              marks: [
                Plot.line(rows, { x: 'k', y: 'users', stroke: ACCENT.blue, strokeWidth: 2, curve: 'monotone-x' }),
                Plot.line(rows, { x: 'k', y: 'reviews', stroke: ACCENT.amber, strokeWidth: 2, curve: 'monotone-x' }),
                Plot.dot(rows, {
                  x: 'k',
                  y: 'users',
                  r: 2.4,
                  fill: ACCENT.blue,
                  tip: true,
                  title: (d: (typeof rows)[number]) =>
                    `${d.k} categor${d.k === 1 ? 'y' : 'ies'}\n${int(d.users)} reviewers (${pct(d.userShare)})\n${int(d.reviews)} reviews (${pct(d.reviewShare)})`,
                }),
                Plot.dot(rows, { x: 'k', y: 'reviews', r: 2.4, fill: ACCENT.amber }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>
    </Section>
  );
}

// ── §2 Transitions ─────────────────────────────────────────────────────────

function WhoStaysPut({ data }: { data: CrossCategory }) {
  const keys = React.useMemo(
    () => [...new Set(data.transitions.map(t => t.a))].sort((a, b) => data.labels[a].localeCompare(data.labels[b])),
    [data]
  );
  const stay = React.useMemo(
    () =>
      keys
        .map(k => {
          const self = data.transitions.find(t => t.a === k && t.b === k);
          return { key: k, label: data.labels[k], share: self?.share ?? 0, n: self?.n ?? 0 };
        })
        .sort((a, b) => b.share - a.share),
    [keys, data]
  );
  const top = stay[0];
  const bottom = stay[stay.length - 1];

  return (
    <Section
      eyebrow="Transitions"
      title="Where a reviewer goes next"
      lede={
        <>
          Take every consecutive pair of reviews by the same person and ask whether the category
          changed. {top.label} is the stickiest at {pct(top.share)} — most of the time a{' '}
          {top.label} review is followed by another one. {bottom.label} is the least sticky at{' '}
          {pct(bottom.share)}. The diagonal of the transition matrix is a measure of how
          self-contained a market is.
        </>
      }
    >
      <ChartCard
        title="Probability the next review stays in the same category"
        subtitle="Diagonal of the 33×33 transition matrix, as a share of that category's outgoing transitions."
      >
        <PlotFigure
          ariaLabel="Bar chart of same-category transition probability."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 54,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Share of next reviews staying put →', grid: true, tickFormat: (v: number) => `${v}%` },
              y: { label: null, domain: stay.map(s => s.label) },
              marks: [
                Plot.barX(stay, {
                  x: 'share',
                  y: 'label',
                  fill: ACCENT.teal,
                  fillOpacity: 0.8,
                  tip: true,
                  title: (d: (typeof stay)[number]) =>
                    `${d.label}\n${pct(d.share)} of following reviews stay here\n${int(d.n)} same-category transitions`,
                }),
                Plot.text(stay, {
                  x: 'share',
                  y: 'label',
                  text: (d: (typeof stay)[number]) => pct(d.share, 0),
                  dx: 6,
                  textAnchor: 'start',
                  fontSize: 10,
                  fill: MUTED,
                }),
                Plot.ruleX([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <Aside>
        Stickiness tracks size almost mechanically — a reviewer in a huge category is likely to stay
        there by chance alone, because that is where the products are. Read this as a description of
        the corpus, not as evidence of loyalty. The co-occurrence chart below normalises against
        exactly that, which is why it says something different.
      </Aside>
    </Section>
  );
}

// ── §3 Co-occurrence ───────────────────────────────────────────────────────

function WhichShelvesShareReaders({ data }: { data: CrossCategory }) {
  // Symmetrise the upper-triangle pair list into a full matrix for the heatmap.
  const cells = React.useMemo(() => {
    const out: Array<{ a: string; b: string; users: number }> = [];
    for (const p of data.cooccurrence) {
      out.push({ a: p.a, b: p.b, users: p.users });
      if (p.a !== p.b) out.push({ a: p.b, b: p.a, users: p.users });
    }
    return out;
  }, [data]);

  const order = React.useMemo(() => {
    const total = new Map<string, number>();
    for (const c of cells) total.set(c.a, (total.get(c.a) ?? 0) + c.users);
    return [...total.entries()].sort((x, y) => y[1] - x[1]).map(([k]) => data.labels[k]);
  }, [cells, data]);

  const labelled = cells.map(c => ({ a: data.labels[c.a], b: data.labels[c.b], users: c.users }));
  const strongest = [...data.cooccurrence].sort((x, y) => y.users - x.users).slice(0, 10);

  return (
    <Section
      eyebrow="Adjacency"
      title="Which shelves share readers"
      lede={
        <>
          {data.cooccurrence.length} category pairs, counted by how many reviewers appear in both. The
          strongest link is {data.labels[strongest[0].a]} ↔ {data.labels[strongest[0].b]} with{' '}
          {compact(strongest[0].users)} shared reviewers. Rows and columns are ordered by total
          overlap, so the dense block in the top-left is the general-merchandise core that almost
          everyone passes through.
        </>
      }
    >
      <ChartCard
        title="Shared reviewers between categories"
        subtitle="Reviewers appearing in both categories. Log colour scale; the diagonal is omitted."
      >
        <PlotFigure
          ariaLabel="Heatmap of shared reviewers between category pairs."
          options={width =>
            ({
              width,
              height: Math.min(760, Math.max(520, width)),
              marginLeft: width < 640 ? 128 : 172,
              marginTop: 128,
              marginBottom: 8,
              marginRight: 10,
              style: plotStyle,
              x: { label: null, axis: 'top', domain: order, tickRotate: -50, tickSize: 0 },
              y: { label: null, domain: order, tickSize: 0 },
              color: { type: 'log', scheme: 'YlGnBu', label: 'Shared reviewers', legend: true },
              marks: [
                Plot.cell(labelled, {
                  x: 'a',
                  y: 'b',
                  fill: 'users',
                  inset: 0.5,
                  tip: true,
                  title: (d: { a: string; b: string; users: number }) =>
                    `${d.a} ↔ ${d.b}\n${int(d.users)} shared reviewers`,
                }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <ChartCard
        className="mt-4"
        title="Strongest ten pairs"
        subtitle="By absolute number of shared reviewers — which mostly means by size."
      >
        <ol className="divide-y divide-hub-line">
          {strongest.map((p, i) => (
            <li key={`${p.a}-${p.b}`} className="flex items-center gap-3 py-2">
              <span className="w-5 shrink-0 font-plex text-[11px] tabular-nums text-hub-ink-faint">{i + 1}</span>
              <span className="flex-1 text-[13.5px] text-hub-ink">
                {data.labels[p.a]} <span className="text-hub-ink-faint">↔</span> {data.labels[p.b]}
              </span>
              <span className="shrink-0 font-plex text-[12.5px] tabular-nums text-hub-ink">
                {compact(p.users)}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 border-t border-hub-line pt-2.5 text-[12px] leading-snug text-hub-ink-faint">
          Absolute overlap is dominated by the biggest categories, so this list is close to a size
          ranking. Turning it into a genuine affinity measure means dividing by what independence
          would predict — the pair counts here support that, but the published aggregates do not
          include the per-category reviewer totals it needs, so it is left undone rather than done
          wrongly.
        </p>
      </ChartCard>
    </Section>
  );
}
