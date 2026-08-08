'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChartCard, Aside, Section, plotStyle } from './ui';
import { eras } from './derive';
import { MEDIA } from './Overview';
import {
  ACCENT,
  ALL,
  GRID,
  MIN_CELL,
  MUTED,
  SURFACE,
  compact,
  int,
  isoDate,
  pct,
  type AmazonData,
  type CategoryStat,
  type Cell,
} from './types';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/**
 * The corpus as a time series: volume, mean rating, and verified share by year,
 * with a per-category selector. Deliberately separate from the seasonality
 * page — `ts_yearly` is the only one of the four published time files that is
 * actually chronological, and mixing it with the pooled cyclical profiles is
 * how readers end up treating a January bar as a date.
 */
export function GrowthReport({ data }: { data: AmazonData }) {
  const [selected, setSelected] = React.useState<string>(ALL);
  const current = data.categories.find(c => c.key === selected);
  const label = current?.label ?? `all ${data.meta.categoryCount} categories`;

  return (
    <>
      <TheEras data={data} />

      <Section
        eyebrow="Explore"
        title="Volume and rating by year, one category at a time"
        id="explore"
        lede="Pick a category. The two charts below and the numbers in the prose all follow the selection."
      >
        <div className="mb-5">
          <label className="flex flex-wrap items-center gap-2 text-[13px] text-hub-ink-faint">
            <span className="font-plex text-[10.5px] uppercase tracking-wider">Category</span>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="max-w-full rounded-md border border-hub-line bg-hub-card px-2.5 py-1.5 text-[13.5px] text-hub-ink shadow-sm transition-colors hover:border-hub-line-strong focus:border-hub-teal focus:outline-none"
            >
              <option value={ALL}>All {data.meta.categoryCount} categories</option>
              {data.categories.map(c => (
                <option key={c.key} value={c.key}>
                  {c.label} · {compact(c.n)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TheCurves data={data} catKey={selected} label={label} />
      </Section>

      <TheLengthSpread data={data} />
    </>
  );
}

// ── Eras ───────────────────────────────────────────────────────────────────

function TheEras({ data }: { data: AmazonData }) {
  const bands = React.useMemo(() => eras(data), [data]);
  const early = bands[0];
  const modern = bands[2];
  const y = data.series.yearly[ALL];
  const peak = y.reduce((a, b) => (b.n > a.n ? b : a));
  const jump2013 = y.find(c => c.t === 2013)!;
  const y2012 = y.find(c => c.t === 2012)!;

  return (
    <Section
      eyebrow="Composition"
      title="The first seventeen years are 3.7% of the data"
      lede={
        <>
          {early.label} spans {early.years} of the corpus&rsquo;s 28 years and contributes{' '}
          {pct(early.share)} of its reviews. {modern.label} contributes {pct(modern.share)}. Any
          statistic pooled across the full history is, arithmetically, a statistic about the last
          decade — so &ldquo;we have data back to 1996&rdquo; is true and almost never load-bearing.
        </>
      }
    >
      <ChartCard
        title="Reviews per year, all categories"
        subtitle={`Bars shaded by era. ${y[y.length - 1].t} is partial — the corpus stops at ${isoDate(data.meta.to)}.`}
      >
        <PlotFigure
          ariaLabel="Bar chart of reviews per year across all categories, shaded by era."
          options={width =>
            ({
              width,
              height: 280,
              marginLeft: 58,
              marginBottom: 38,
              marginRight: 12,
              style: plotStyle,
              x: { label: null, tickFormat: 'd', ticks: [1996, 2000, 2004, 2008, 2012, 2016, 2020, 2023] },
              y: { label: '↑ Reviews', grid: true, tickFormat: (d: number) => compact(d) },
              marks: [
                Plot.rectY(y, {
                  x: 't',
                  y: 'n',
                  interval: 1,
                  insetLeft: 0.6,
                  insetRight: 0.6,
                  fill: (d: Cell) =>
                    d.t <= 2012 ? ACCENT.teal : d.t <= 2016 ? ACCENT.plum : ACCENT.blue,
                  fillOpacity: (d: Cell) => (d.t === 2023 ? 0.4 : 0.9),
                  tip: true,
                  title: (d: Cell) =>
                    `${d.t}${d.t === 2023 ? ' (partial)' : ''}\n${int(d.n)} reviews\n${d.r.toFixed(2)}★ mean · ${pct(d.v)} verified`,
                }),
                Plot.ruleY([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-hub-ink-faint">
          {bands.map((b, i) => (
            <span key={b.label} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: [ACCENT.teal, ACCENT.plum, ACCENT.blue][i] }}
              />
              {b.label} — {pct(b.share)}
            </span>
          ))}
        </div>
      </ChartCard>

      <Aside>
        Two discontinuities matter more than the trend. Volume went from {compact(y2012.n)} in 2012
        to {compact(jump2013.n)} in 2013 — a {(jump2013.n / y2012.n).toFixed(1)}× jump in one year,
        which is a change in what Amazon captured and surfaced, not a change in how much people
        shopped. And volume peaked in {peak.t} at {compact(peak.n)} and has fallen since. Treat any
        pre-2013 comparison as a comparison across two different data-generating processes.
      </Aside>
    </Section>
  );
}

// ── Per-category curves ────────────────────────────────────────────────────

function TheCurves({ data, catKey, label }: { data: AmazonData; catKey: string; label: string }) {
  const cells = data.series.yearly[catKey] ?? [];
  const rateCells = cells.filter(c => c.n >= MIN_CELL);
  const lastYear = cells[cells.length - 1]?.t;
  const peak = cells.reduce((a, b) => (b.n > a.n ? b : a), cells[0]);
  // Restrict the "best/worst year" claim to years carrying at least 1% of the
  // category — otherwise a 1997 with 5,000 reviews wins on a technicality.
  const total = cells.reduce((s, c) => s + c.n, 0);
  const solid = rateCells.filter(c => c.n >= total * 0.01);
  const pool = solid.length >= 3 ? solid : rateCells;
  const best = pool.reduce((a, b) => (b.r > a.r ? b : a), pool[0]);
  const worst = pool.reduce((a, b) => (b.r < a.r ? b : a), pool[0]);

  return (
    <>
      <p className="mb-4 max-w-2xl text-[14.5px] leading-relaxed text-hub-ink-soft">
        <strong className="font-semibold text-hub-ink">{label}</strong> peaked in {peak.t} at{' '}
        {compact(peak.n)} reviews. Among years carrying at least 1% of the category, the mean rating
        was highest in {best.t} ({best.r.toFixed(2)}★) and lowest in {worst.t} ({worst.r.toFixed(2)}
        ★) — a spread of {(best.r - worst.r).toFixed(2)} stars that has nothing to do with which
        products were sold.
      </p>

      <ChartCard
        title={`Reviews per year — ${label}`}
        subtitle={`${lastYear} is a partial year and is drawn faded.`}
      >
        <PlotFigure
          ariaLabel={`Bar chart of reviews per year for ${label}.`}
          options={width =>
            ({
              width,
              height: 240,
              marginLeft: 58,
              marginBottom: 34,
              marginRight: 10,
              style: plotStyle,
              x: { label: null, tickFormat: 'd', ticks: yearTicks(cells) },
              y: { label: '↑ Reviews', grid: true, tickFormat: (d: number) => compact(d) },
              marks: [
                Plot.rectY(cells, {
                  x: 't',
                  y: 'n',
                  interval: 1,
                  insetLeft: 0.6,
                  insetRight: 0.6,
                  fill: ACCENT.blue,
                  fillOpacity: (d: Cell) => (d.t === lastYear ? 0.4 : 0.9),
                  tip: true,
                  title: (d: Cell) =>
                    `${d.t}${d.t === lastYear ? ' (partial)' : ''}\n${int(d.n)} reviews\n${d.r.toFixed(2)}★ mean · ${pct(d.v)} verified`,
                }),
                Plot.ruleY([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <ChartCard
        className="mt-4"
        title={`Mean rating and verified share by year — ${label}`}
        subtitle={`Years under ${int(MIN_CELL)} reviews are dropped — a rate computed on a handful of reviews is noise.`}
      >
        <PlotFigure
          ariaLabel={`Line chart of mean star rating per year for ${label}.`}
          options={width =>
            ({
              width,
              height: 230,
              marginLeft: 58,
              marginBottom: 34,
              marginRight: 46,
              style: plotStyle,
              x: { label: null, tickFormat: 'd', ticks: yearTicks(rateCells) },
              y: { label: '↑ Mean ★', grid: true, domain: ratingDomain(rateCells) },
              marks: [
                Plot.line(rateCells, {
                  x: 't',
                  y: 'r',
                  stroke: ACCENT.amber,
                  strokeWidth: 2.2,
                  curve: 'monotone-x',
                }),
                Plot.dot(rateCells, {
                  x: 't',
                  y: 'r',
                  r: 2.6,
                  fill: ACCENT.amber,
                  stroke: SURFACE,
                  strokeWidth: 1,
                  tip: true,
                  title: (d: Cell) =>
                    `${d.t}\n${d.r.toFixed(3)}★ mean\n${pct(d.d[4])} five-star · ${pct(d.d[0])} one-star\n${pct(d.v)} verified · ${int(d.n)} reviews`,
                }),
              ],
            }) as PlotOptions
          }
        />
        <PlotFigure
          className="mt-2"
          ariaLabel={`Line chart of verified-purchase share per year for ${label}.`}
          options={width =>
            ({
              width,
              height: 150,
              marginLeft: 58,
              marginBottom: 34,
              marginRight: 46,
              style: plotStyle,
              x: { label: null, tickFormat: 'd', ticks: yearTicks(rateCells) },
              y: {
                label: '↑ Verified',
                grid: true,
                domain: [0, 100],
                tickFormat: (v: number) => `${v}%`,
              },
              marks: [
                Plot.areaY(rateCells, {
                  x: 't',
                  y: 'v',
                  fill: ACCENT.teal,
                  fillOpacity: 0.15,
                  curve: 'monotone-x',
                }),
                Plot.line(rateCells, {
                  x: 't',
                  y: 'v',
                  stroke: ACCENT.teal,
                  strokeWidth: 2,
                  curve: 'monotone-x',
                }),
                Plot.ruleY([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <Aside>
        The verified-purchase curve is the reason the rating curve is hard to read as a change in
        product quality. Verified share climbed from single digits to the low nineties over the same
        period the mean rating moved — so the population writing reviews was being replaced while
        the average was being computed.
      </Aside>
    </>
  );
}

function yearTicks(cells: Cell[]): number[] {
  if (cells.length === 0) return [];
  const first = cells[0].t;
  const last = cells[cells.length - 1].t;
  const out: number[] = [];
  for (let y = last; y >= first; y -= 4) out.unshift(y);
  if (out[0] !== first) out.unshift(first);
  return out;
}

function ratingDomain(cells: Cell[]): [number, number] {
  if (cells.length === 0) return [1, 5];
  const lo = Math.min(...cells.map(c => c.r));
  const hi = Math.max(...cells.map(c => c.r));
  const pad = Math.max(0.06, (hi - lo) * 0.18);
  return [Math.max(1, lo - pad), Math.min(5, hi + pad)];
}

// ── Review length ──────────────────────────────────────────────────────────

function TheLengthSpread({ data }: { data: AmazonData }) {
  const rows = React.useMemo(() => [...data.categories].sort((a, b) => b.l - a.l), [data.categories]);
  const longest = rows[0];
  const shortest = rows[rows.length - 1];

  return (
    <Section
      eyebrow="Effort"
      title="A CD review is five times a gift-card review"
      lede={
        <>
          Mean review length runs from {Math.round(longest.l)} characters in {longest.label} down to{' '}
          {Math.round(shortest.l)} in {shortest.label}. The long end of the scale is entirely media —
          the categories where a review is a piece of criticism rather than a receipt.
        </>
      }
    >
      <ChartCard
        title="Mean review length by category"
        subtitle="Characters. Media categories in amber."
      >
        <PlotFigure
          ariaLabel="Horizontal bar chart of mean review length by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 44,
              marginBottom: 34,
              style: plotStyle,
              x: { label: 'Mean characters →', grid: true },
              y: { label: null, domain: rows.map(c => c.label) },
              marks: [
                Plot.barX(rows, {
                  x: 'l',
                  y: 'label',
                  fill: (d: CategoryStat) => (MEDIA.has(d.key) ? ACCENT.amber : ACCENT.blue),
                  fillOpacity: 0.8,
                  tip: true,
                  title: (d: CategoryStat) =>
                    `${d.label}\n${Math.round(d.l)} characters\n${int(d.n)} reviews · ${d.r.toFixed(2)}★`,
                }),
                Plot.text(rows, {
                  x: 'l',
                  y: 'label',
                  text: (d: CategoryStat) => Math.round(d.l).toString(),
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
    </Section>
  );
}
