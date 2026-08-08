'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import {
  ACCENT,
  ALL,
  GRID,
  INK,
  MIN_CELL,
  MUTED,
  STARS,
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
 * The body of /teaching/amazon: a guided read of the pre-computed aggregates
 * over the Amazon Reviews 2023 corpus. One piece of shared state — the
 * selected category — drives the trend and rhythm charts, so the same charts
 * answer "what does the whole corpus look like" and "what does Books look
 * like" without duplicating the layout.
 */
export function AmazonReport({ data }: { data: AmazonData }) {
  const [selected, setSelected] = React.useState<string>(ALL);
  const { meta, categories } = data;

  const current = categories.find(c => c.key === selected);
  const label = current?.label ?? `all ${meta.categoryCount} categories`;

  return (
    <div className="pb-20">
      <TheShapeOfRatings data={data} />
      <TheCategories data={data} selected={selected} onSelect={setSelected} />
      <TheVerificationGap data={data} onSelect={setSelected} />

      <div className="scroll-mt-20 border-t border-border pt-12" id="explore">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Explore</Eyebrow>
            <h2 className="mt-1.5 font-display text-[clamp(21px,3vw,28px)] font-semibold leading-tight text-body">
              The same five charts, one category at a time
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
              Everything below reads from the current selection. Switch it here, or click any row in
              the leaderboard above.
            </p>
          </div>
          <CategoryPicker categories={categories} value={selected} onChange={setSelected} />
        </div>

        <TheGrowthCurve data={data} catKey={selected} label={label} />
        <TheRhythms data={data} catKey={selected} label={label} />
      </div>

      <TheLengthSpread data={data} />
      <HowToUseIt data={data} />
    </div>
  );
}

// ── §1 Rating distribution ─────────────────────────────────────────────────

function TheShapeOfRatings({ data }: { data: AmazonData }) {
  const { meta } = data;
  const extremes = meta.dist[0] + meta.dist[4];
  // Complement rather than a second sum: the five shares are each rounded to
  // 2dp upstream, so adding three of them and adding two of them independently
  // produces a pair that reads as 100.1%.
  const middle = 100 - extremes;

  return (
    <Section
      eyebrow="The distribution"
      title={`A mean of ${meta.avgRating.toFixed(2)} describes almost nothing`}
      lede={
        <>
          Star ratings are not bell-shaped. Across all {compact(meta.totalReviews)} reviews,{' '}
          {pct(extremes)} of the mass sits at the two ends of the scale and only {pct(middle)} sits
          in the middle three. The distribution is J-shaped: 5★ is the mode, 1★ is the runner-up, and
          the arithmetic mean lands in a region where almost nobody actually rates.
        </>
      }
    >
      <ChartCard
        title="Share of all reviews by star rating"
        subtitle={`${int(meta.totalReviews)} reviews, ${meta.categoryCount} categories, ${isoDate(meta.from)} – ${isoDate(meta.to)}.`}
      >
        <ol className="mt-1 space-y-2.5">
          {[4, 3, 2, 1, 0].map(i => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-right font-mono text-[12.5px] tabular-nums text-muted">
                {i + 1}★
              </span>
              <span className="relative h-7 flex-1 overflow-hidden rounded-sm bg-card">
                <span
                  className="absolute inset-y-0 left-0 rounded-sm transition-[width] duration-700 ease-out"
                  style={{ width: `${meta.dist[i]}%`, backgroundColor: STARS[i] }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-mono text-[12.5px] font-medium tabular-nums text-body">
                {meta.dist[i].toFixed(1)}%
              </span>
              <span className="hidden w-20 shrink-0 text-right font-mono text-[12px] tabular-nums text-muted sm:block">
                {compact(Math.round((meta.dist[i] / 100) * meta.totalReviews))}
              </span>
            </li>
          ))}
        </ol>
      </ChartCard>

      <Aside>
        This is the single most consequential fact about review data. Any model, dashboard, or
        pricing rule that treats &ldquo;average rating&rdquo; as a location parameter is summarising
        a bimodal distribution with a number that describes neither mode. The useful summaries are
        share-at-5★, share-at-1★, and the ratio between them.
      </Aside>
    </Section>
  );
}

// ── §2 Category leaderboard ────────────────────────────────────────────────

type SortKey = 'n' | 'r' | 'five' | 'v' | 'l';

const SORTS: Array<{ key: SortKey; label: string; short: string; fmt: (c: CategoryStat) => string; val: (c: CategoryStat) => number }> = [
  { key: 'n', label: 'Reviews', short: 'Reviews', fmt: c => compact(c.n), val: c => c.n },
  { key: 'r', label: 'Mean rating', short: 'Mean ★', fmt: c => c.r.toFixed(2), val: c => c.r },
  { key: 'five', label: 'Share 5★', short: '5★ %', fmt: c => pct(c.d[4]), val: c => c.d[4] },
  { key: 'v', label: 'Verified purchase', short: 'Verified %', fmt: c => pct(c.v), val: c => c.v },
  { key: 'l', label: 'Mean length', short: 'Chars', fmt: c => `${Math.round(c.l)}`, val: c => c.l },
];

function TheCategories({
  data,
  selected,
  onSelect,
}: {
  data: AmazonData;
  selected: string;
  onSelect: (key: string) => void;
}) {
  const [sort, setSort] = React.useState<SortKey>('n');
  const active = SORTS.find(s => s.key === sort)!;

  const rows = React.useMemo(
    () => [...data.categories].sort((a, b) => active.val(b) - active.val(a)),
    [data.categories, active]
  );
  const max = active.val(rows[0]);
  const min = active.val(rows[rows.length - 1]);

  const top3 = [...data.categories].sort((a, b) => b.n - a.n).slice(0, 3);
  const top3Share = (top3.reduce((s, c) => s + c.n, 0) / data.meta.totalReviews) * 100;
  const smallest = [...data.categories].sort((a, b) => a.n - b.n)[0];

  return (
    <Section
      eyebrow="The categories"
      title="Three categories are a third of the corpus"
      lede={
        <>
          {top3.map(c => c.label).join(', ')} together hold {pct(top3Share)} of every review ever
          written. {smallest.label}, the smallest slice, holds {int(smallest.n)} —{' '}
          {Math.round(top3[0].n / smallest.n).toLocaleString()}× fewer than {top3[0].label}. Compare
          categories on rates, never on raw counts.
        </>
      }
    >
      <ChartCard
        title="All 33 categories"
        subtitle="Click a row to make it the active category for the charts below. Sort by any column."
        controls={
          <div className="flex flex-wrap gap-1">
            {SORTS.map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSort(s.key)}
                aria-pressed={sort === s.key}
                className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                  sort === s.key
                    ? 'bg-brand-primary text-white'
                    : 'bg-card text-muted hover:bg-code-bg hover:text-body'
                }`}
              >
                {s.short}
              </button>
            ))}
          </div>
        }
      >
        <ol className="divide-y divide-border">
          {rows.map((c, i) => {
            const isActive = c.key === selected;
            // Bars are scaled to the visible spread of the active metric, not
            // to zero — mean ratings all sit between 3.8 and 4.6, and a
            // zero-based bar would show 33 identical stripes.
            const span = max - min || 1;
            const width = sort === 'n' ? (c.n / max) * 100 : 12 + ((active.val(c) - min) / span) * 88;
            return (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => onSelect(isActive ? ALL : c.key)}
                  className={`group flex w-full items-center gap-3 px-2 py-2 text-left transition-colors ${
                    isActive ? 'bg-card' : 'hover:bg-card'
                  }`}
                >
                  <span className="w-5 shrink-0 font-mono text-[11px] tabular-nums text-muted">
                    {i + 1}
                  </span>
                  <span
                    className={`w-[8.5rem] shrink-0 truncate text-[13.5px] leading-snug sm:w-52 ${
                      isActive ? 'font-semibold text-link' : 'text-body group-hover:text-link'
                    }`}
                  >
                    {c.label}
                  </span>
                  <span className="relative hidden h-2.5 flex-1 overflow-hidden rounded-full bg-code-bg sm:block">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
                      style={{
                        width: `${width}%`,
                        backgroundColor: isActive ? ACCENT.orange : ACCENT.sky,
                        opacity: isActive ? 1 : 0.75,
                      }}
                    />
                  </span>
                  <span className="w-16 shrink-0 text-right font-mono text-[12.5px] font-medium tabular-nums text-body">
                    {active.fmt(c)}
                  </span>
                  <span className="hidden w-40 shrink-0 justify-end gap-3 font-mono text-[11.5px] tabular-nums text-muted lg:flex">
                    {sort !== 'n' && <span title="reviews">{compact(c.n)}</span>}
                    {sort !== 'r' && <span title="mean rating">{c.r.toFixed(2)}★</span>}
                    {sort !== 'v' && <span title="verified purchase share">{Math.round(c.v)}% v</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </ChartCard>
    </Section>
  );
}

// ── §3 Verified vs rating ──────────────────────────────────────────────────

/** Categories whose reviews decouple from a purchase on Amazon. */
const MEDIA = new Set([
  'Books',
  'Kindle_Store',
  'CDs_and_Vinyl',
  'Digital_Music',
  'Movies_and_TV',
]);

/**
 * Points that get a printed label. Deliberately not "everything large" — the
 * high-verified, mid-rating corner holds a dozen general-merchandise
 * categories on top of each other, and labelling them all turns the corner
 * into a smudge. Everything else is one hover away.
 */
const LABELLED = new Set([
  ...MEDIA,
  'Gift_Cards',
  'Handmade_Products',
  'Subscription_Boxes',
  'Software',
  'Automotive',
  'Home_and_Kitchen',
]);

function TheVerificationGap({ data, onSelect }: { data: AmazonData; onSelect: (k: string) => void }) {
  const cats = data.categories;
  const media = cats.filter(c => MEDIA.has(c.key));
  const rest = cats.filter(c => !MEDIA.has(c.key));
  const mediaV = weight(media, c => c.v);
  const restV = weight(rest, c => c.v);
  const mediaR = weight(media, c => c.r);
  const restR = weight(rest, c => c.r);

  return (
    <Section
      eyebrow="Verification"
      title="The least-verified categories are the best-rated"
      lede={
        <>
          {pct(data.meta.verifiedPct)} of reviews carry a verified-purchase flag — but that share
          collapses in media. Books, Kindle, CDs &amp; Vinyl, Digital Music, and Movies &amp; TV
          average {pct(mediaV)} verified against {pct(restV)} everywhere else, and they rate{' '}
          {mediaR.toFixed(2)}★ against {restR.toFixed(2)}★. People review books they did not buy on
          Amazon, and they are kinder when they do.
        </>
      }
    >
      <ChartCard
        title="Verified-purchase share against mean rating"
        subtitle="One dot per category, sized by review volume. Media categories in orange."
      >
        <PlotFigure
          className="[&_svg]:mx-auto"
          ariaLabel="Scatterplot of verified-purchase share against mean rating, one point per category."
          options={width =>
            ({
              width,
              height: Math.min(430, Math.max(320, width * 0.55)),
              marginLeft: 52,
              marginBottom: 46,
              marginRight: 16,
              style: plotStyle,
              x: {
                label: 'Verified-purchase share →',
                grid: true,
                domain: [64, 100],
                tickFormat: d => `${d}%`,
              },
              y: { label: '↑ Mean star rating', grid: true, domain: [3.7, 4.65] },
              r: { range: [3.5, 26] },
              marks: [
                Plot.dot(cats, {
                  x: 'v',
                  y: 'r',
                  r: 'n',
                  fill: d => (MEDIA.has(d.key) ? ACCENT.orange : ACCENT.sky),
                  fillOpacity: 0.62,
                  stroke: d => (MEDIA.has(d.key) ? ACCENT.orange : ACCENT.sky),
                  strokeWidth: 1.2,
                  tip: true,
                  title: d =>
                    `${d.label}\n${int(d.n)} reviews\n${d.r.toFixed(2)}★ mean · ${pct(d.d[4])} five-star\n${pct(d.v)} verified · ${Math.round(d.l)} chars`,
                }),
                Plot.text(cats.filter(c => LABELLED.has(c.key)), {
                  x: 'v',
                  y: 'r',
                  text: 'label',
                  dy: -14,
                  fontSize: 10.5,
                  fill: MUTED,
                  stroke: SURFACE,
                  strokeWidth: 3,
                  paintOrder: 'stroke',
                }),
              ],
            }) as PlotOptions
          }
        />
        <Legend
          items={[
            { label: 'Media (book, music, video)', color: ACCENT.orange },
            { label: 'Everything else', color: ACCENT.sky },
          ]}
        />
      </ChartCard>

      <Aside>
        Treat the verified flag as a <em>sampling</em> variable, not a quality filter. Restricting to
        verified reviews does not just remove noise — it removes Books, Kindle, and CDs from your
        sample far more aggressively than it removes Automotive, and it shifts the rating
        distribution while it does so.{' '}
        <button
          type="button"
          onClick={() => onSelect('Books')}
          className="font-medium text-link underline decoration-link/40 underline-offset-2 hover:decoration-link"
        >
          See Books on its own →
        </button>
      </Aside>
    </Section>
  );
}

function weight(cats: CategoryStat[], pick: (c: CategoryStat) => number): number {
  const n = cats.reduce((s, c) => s + c.n, 0);
  return cats.reduce((s, c) => s + c.n * pick(c), 0) / n;
}

// ── §4 Growth ──────────────────────────────────────────────────────────────

function TheGrowthCurve({ data, catKey, label }: { data: AmazonData; catKey: string; label: string }) {
  const cells = data.series.yearly[catKey] ?? [];
  const rateCells = cells.filter(c => c.n >= MIN_CELL);
  const lastYear = cells[cells.length - 1]?.t;
  const peak = cells.reduce((a, b) => (b.n > a.n ? b : a), cells[0]);
  const best = rateCells.reduce((a, b) => (b.r > a.r ? b : a), rateCells[0]);
  const worst = rateCells.reduce((a, b) => (b.r < a.r ? b : a), rateCells[0]);

  return (
    <div className="mt-10">
      <h3 className="font-display text-[19px] font-semibold text-body">
        Volume and mean rating by year — {label}
      </h3>
      <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-muted">
        Volume peaked in {peak.t} at {compact(peak.n)} reviews. The mean rating was highest in{' '}
        {best.t} ({best.r.toFixed(2)}★) and lowest in {worst.t} ({worst.r.toFixed(2)}★) — a spread of{' '}
        {(best.r - worst.r).toFixed(2)} stars that has nothing to do with which products were sold
        and everything to do with who was writing.
      </p>

      <ChartCard
        className="mt-4"
        title="Reviews per year"
        subtitle={`${lastYear} is a partial year — the corpus stops at ${isoDate(data.meta.to)} — and is drawn faded.`}
      >
        <PlotFigure
          ariaLabel={`Bar chart of reviews per year for ${label}.`}
          options={width =>
            ({
              width,
              height: 250,
              marginLeft: 58,
              marginBottom: 34,
              marginRight: 10,
              style: plotStyle,
              x: { label: null, tickFormat: '', ticks: yearTicks(cells) },
              y: { label: '↑ Reviews', grid: true, tickFormat: (d: number) => compact(d) },
              marks: [
                Plot.rectY(cells, {
                  x: 't',
                  y: 'n',
                  interval: 1,
                  insetLeft: 0.6,
                  insetRight: 0.6,
                  fill: ACCENT.sky,
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
        title="Mean star rating per year"
        subtitle={`Years with fewer than ${int(MIN_CELL)} reviews are dropped — a rate computed on a handful of reviews is noise, not signal.`}
      >
        <PlotFigure
          ariaLabel={`Line chart of mean star rating per year for ${label}.`}
          options={width =>
            ({
              width,
              height: 220,
              marginLeft: 58,
              marginBottom: 34,
              marginRight: 10,
              style: plotStyle,
              x: { label: null, tickFormat: 'd', ticks: yearTicks(rateCells) },
              y: { label: '↑ Mean ★', grid: true, domain: ratingDomain(rateCells) },
              marks: [
                Plot.areaY(rateCells, {
                  x: 't',
                  y: 'r',
                  fill: ACCENT.orange,
                  fillOpacity: 0.12,
                  y1: ratingDomain(rateCells)[0],
                  curve: 'monotone-x',
                }),
                Plot.line(rateCells, {
                  x: 't',
                  y: 'r',
                  stroke: ACCENT.orange,
                  strokeWidth: 2,
                  curve: 'monotone-x',
                }),
                Plot.dot(rateCells, {
                  x: 't',
                  y: 'r',
                  r: 2.6,
                  fill: ACCENT.orange,
                  stroke: SURFACE,
                  strokeWidth: 1,
                  tip: true,
                  title: (d: Cell) =>
                    `${d.t}\n${d.r.toFixed(3)}★ mean\n${pct(d.d[4])} five-star · ${pct(d.d[0])} one-star\n${int(d.n)} reviews`,
                }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>
    </div>
  );
}

/** Year ticks every 4 years, always including the first and last. */
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

// ── §5 Rhythms ─────────────────────────────────────────────────────────────

function TheRhythms({ data, catKey, label }: { data: AmazonData; catKey: string; label: string }) {
  const monthly = data.series.monthly[catKey] ?? [];
  const dow = data.series.dayofweek[catKey] ?? [];
  const hourly = data.series.hourly[catKey] ?? [];

  const shares = (cells: Cell[]) => {
    const total = cells.reduce((s, c) => s + c.n, 0) || 1;
    return cells.map(c => ({ ...c, share: (c.n / total) * 100 }));
  };
  const m = shares(monthly);
  const d = shares(dow);
  const h = shares(hourly);

  const topMonth = m.reduce((a, b) => (b.share > a.share ? b : a), m[0]);
  const lowMonth = m.reduce((a, b) => (b.share < a.share ? b : a), m[0]);
  const topHour = h.reduce((a, b) => (b.share > a.share ? b : a), h[0]);
  const lowHour = h.reduce((a, b) => (b.share < a.share ? b : a), h[0]);

  return (
    <div className="mt-12">
      <h3 className="font-display text-[19px] font-semibold text-body">
        Seasonality, weekday, and hour — {label}
      </h3>
      <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-muted">
        {data.monthNames[topMonth.t - 1]} carries {pct(topMonth.share)} of the year&rsquo;s reviews
        against {data.monthNames[lowMonth.t - 1]}&rsquo;s {pct(lowMonth.share)}. Within a day, the
        busiest hour ({String(topHour.t).padStart(2, '0')}:00) runs{' '}
        {(topHour.share / lowHour.share).toFixed(1)}× the quietest (
        {String(lowHour.t).padStart(2, '0')}:00).
      </p>

      <Warning>
        These three panels pool every year from 1996 to 2023. &ldquo;January&rdquo; is every January
        stacked together, not a point on a timeline — read them as cyclical profiles and never as
        trends.
      </Warning>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="By calendar month" subtitle="Share of the category's reviews, all years pooled.">
          <PlotFigure
            ariaLabel={`Bar chart of review share by calendar month for ${label}.`}
            options={width =>
              ({
                width,
                height: 230,
                marginLeft: 42,
                marginBottom: 40,
                style: plotStyle,
                x: { label: null, tickFormat: (i: number) => data.monthNames[i - 1].slice(0, 3) },
                y: { label: '↑ Share', grid: true, tickFormat: (v: number) => `${v.toFixed(0)}%` },
                marks: [
                  Plot.barY(m, {
                    x: 't',
                    y: 'share',
                    fill: (c: Cell & { share: number }) =>
                      c.t === topMonth.t ? ACCENT.orange : ACCENT.sky,
                    fillOpacity: 0.85,
                    tip: true,
                    title: (c: Cell & { share: number }) =>
                      `${data.monthNames[c.t - 1]}\n${pct(c.share)} of reviews (${int(c.n)})\n${c.r.toFixed(2)}★ mean`,
                  }),
                  Plot.ruleY([0], { stroke: GRID }),
                ],
              }) as PlotOptions
            }
          />
        </ChartCard>

        <ChartCard title="By day of week" subtitle="Share of the category's reviews, all years pooled.">
          <PlotFigure
            ariaLabel={`Bar chart of review share by day of week for ${label}.`}
            options={width =>
              ({
                width,
                height: 230,
                marginLeft: 42,
                marginBottom: 40,
                style: plotStyle,
                x: { label: null, tickFormat: (i: number) => data.dayNames[i].slice(0, 3) },
                y: { label: '↑ Share', grid: true, tickFormat: (v: number) => `${v.toFixed(0)}%` },
                marks: [
                  Plot.barY(d, {
                    x: 't',
                    y: 'share',
                    fill: ACCENT.violet,
                    fillOpacity: 0.8,
                    tip: true,
                    title: (c: Cell & { share: number }) =>
                      `${data.dayNames[c.t]}\n${pct(c.share)} of reviews (${int(c.n)})\n${c.r.toFixed(2)}★ mean`,
                  }),
                  Plot.ruleY([0], { stroke: GRID }),
                ],
              }) as PlotOptions
            }
          />
        </ChartCard>
      </div>

      <ChartCard
        className="mt-4"
        title="By hour of day (UTC)"
        subtitle="The overnight trough and afternoon peak line up with North American waking hours, which is what a UTC-stamped, US-heavy corpus looks like."
      >
        <PlotFigure
          ariaLabel={`Area chart of review share by hour of day for ${label}.`}
          options={width =>
            ({
              width,
              height: 240,
              marginLeft: 46,
              marginBottom: 38,
              marginRight: 10,
              style: plotStyle,
              x: {
                label: 'Hour (UTC) →',
                ticks: [0, 4, 8, 12, 16, 20],
                tickFormat: (v: number) => `${String(v).padStart(2, '0')}:00`,
                domain: [0, 23],
              },
              y: { label: '↑ Share', grid: true, tickFormat: (v: number) => `${v.toFixed(0)}%` },
              marks: [
                Plot.areaY(h, {
                  x: 't',
                  y: 'share',
                  fill: ACCENT.emerald,
                  fillOpacity: 0.16,
                  curve: 'monotone-x',
                }),
                Plot.line(h, {
                  x: 't',
                  y: 'share',
                  stroke: ACCENT.emerald,
                  strokeWidth: 2,
                  curve: 'monotone-x',
                }),
                Plot.dot(h, {
                  x: 't',
                  y: 'share',
                  r: 2.4,
                  fill: ACCENT.emerald,
                  tip: true,
                  title: (c: Cell & { share: number }) =>
                    `${String(c.t).padStart(2, '0')}:00 UTC\n${pct(c.share)} of reviews (${int(c.n)})\n${c.r.toFixed(2)}★ mean`,
                }),
                Plot.ruleY([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>
    </div>
  );
}

// ── §6 Review length ───────────────────────────────────────────────────────

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
          {Math.round(shortest.l)} in {shortest.label}. The long tail of the scale is entirely media
          — the categories where a review is a piece of criticism rather than a receipt.
        </>
      }
    >
      <ChartCard
        title="Mean review length by category"
        subtitle="Characters. Media categories in orange, everything else in blue."
      >
        <PlotFigure
          ariaLabel="Horizontal bar chart of mean review length by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 168,
              marginRight: 44,
              marginBottom: 34,
              style: plotStyle,
              x: { label: 'Mean characters →', grid: true },
              y: { label: null, domain: rows.map(c => c.label) },
              marks: [
                Plot.barX(rows, {
                  x: 'l',
                  y: 'label',
                  fill: d => (MEDIA.has(d.key) ? ACCENT.orange : ACCENT.sky),
                  fillOpacity: 0.85,
                  tip: true,
                  title: d =>
                    `${d.label}\n${Math.round(d.l)} characters\n${int(d.n)} reviews · ${d.r.toFixed(2)}★`,
                }),
                Plot.text(rows, {
                  x: 'l',
                  y: 'label',
                  text: d => Math.round(d.l).toString(),
                  dx: 6,
                  textAnchor: 'start',
                  fontSize: 10.5,
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

// ── §7 Using the data ──────────────────────────────────────────────────────

const FILES = [
  { name: 'category_stats_all.csv', rows: '33', what: 'One row per category — volume, mean rating, mean length, verified share, the 1★–5★ split, and the first and last review date.' },
  { name: 'ts_yearly_all.csv', rows: '798', what: 'Category × year, 1996–2023. The only chronological file.' },
  { name: 'ts_monthly_all.csv', rows: '396', what: 'Category × calendar month. Seasonality, all years pooled.' },
  { name: 'ts_dayofweek_all.csv', rows: '231', what: 'Category × weekday (0 = Monday), all years pooled.' },
  { name: 'ts_hourofday_all.csv', rows: '792', what: 'Category × hour (0–23), all years pooled.' },
];

function HowToUseIt({ data }: { data: AmazonData }) {
  const { meta } = data;
  return (
    <Section
      eyebrow="Working with it"
      title="Five CSVs, no text, no identifiers"
      lede={
        <>
          The published aggregates are counts, means, and distributions only — there is no review
          text, no user ID, and no product ID anywhere in them. That is what makes them safe to hand
          out and what makes them useless for per-product or NLP work; for that you need the{' '}
          <a
            href={meta.source}
            className="font-medium text-link underline decoration-link/40 underline-offset-2 hover:decoration-link"
          >
            HuggingFace source
          </a>
          .
        </>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[34rem] border-collapse text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wider text-muted">File</th>
              <th className="px-4 py-2.5 text-right font-mono text-[11px] font-medium uppercase tracking-wider text-muted">Rows</th>
              <th className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wider text-muted">What it holds</th>
            </tr>
          </thead>
          <tbody>
            {FILES.map(f => (
              <tr key={f.name} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-2.5 align-top font-mono text-[12.5px] text-body">{f.name}</td>
                <td className="px-4 py-2.5 text-right align-top font-mono text-[12.5px] tabular-nums text-muted">{f.rows}</td>
                <td className="px-4 py-2.5 align-top leading-snug text-subtle">{f.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <CodeBlock
          label="Plain HTTPS — no credentials"
          code={`import pandas as pd

BASE = "${meta.bucket}"
cats = pd.read_csv(BASE + "category_stats_all.csv")
yrs  = pd.read_csv(BASE + "ts_yearly_all.csv")`}
        />
        <CodeBlock
          label="S3 protocol"
          code={`import boto3, pandas as pd

s3 = boto3.client("s3", endpoint_url="https://t3.storage.dev",
                  region_name="auto")
obj = s3.get_object(Bucket="ontopic-public-data",
                    Key="amazon-reviews/merged_results/"
                        "category_stats_all.csv")
cats = pd.read_csv(obj["Body"])`}
        />
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        The bucket answers anonymous GETs on virtual-host style URLs
        (<code className="rounded bg-code-bg px-1 py-0.5 font-mono text-[12px]">bucket.t3.storage.dev/key</code>);
        the path-style form <code className="rounded bg-code-bg px-1 py-0.5 font-mono text-[12px]">t3.storage.dev/bucket/key</code>{' '}
        returns 403.
      </p>

      <h3 className="mt-10 font-display text-[19px] font-semibold text-body">Four ways to get this wrong</h3>
      <ol className="mt-4 space-y-3">
        {[
          ['Only ts_yearly is a timeline.', 'The monthly, weekday, and hour files pool every year together. Plotting them left-to-right as a time axis produces a chart that means nothing.'],
          ['Filter on count before trusting a rate.', `A category-year holding one review reports rating_5_pct = 100.0. Every rate chart on this page drops cells under ${int(MIN_CELL)} reviews.`],
          ['Volumes span four orders of magnitude.', `${compact(data.categories[0].n)} reviews in ${data.categories[0].label} against ${int([...data.categories].sort((a, b) => a.n - b.n)[0].n)} in ${[...data.categories].sort((a, b) => a.n - b.n)[0].label}. Normalise before you compare.`],
          ['Percent columns are 0–100.', 'Not 0–1. Dividing twice, or not at all, is the most common bug against these files.'],
        ].map(([head, body]) => (
          <li key={head} className="flex gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-secondary" />
            <p className="text-[14px] leading-relaxed text-subtle">
              <span className="font-semibold text-body">{head}</span> {body}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-8 border-t border-border pt-5 text-[13px] leading-relaxed text-muted">
        Derived from{' '}
        <a href={meta.source} className="text-link underline decoration-link/40 underline-offset-2 hover:decoration-link">
          McAuley-Lab/Amazon-Reviews-2023
        </a>{' '}
        and inherits its terms. Aggregation ran on Google Cloud Run, one job per category, streaming
        each <code className="font-mono">raw_review_*</code> split; the five merged CSVs were
        migrated to Tigris in August 2026 with every object verified by MD5. Charts on this page read
        a {meta.categoryCount}-category JSON built from those CSVs by{' '}
        <code className="font-mono text-[12px]">scripts/fetch-amazon-aggregates.mjs</code>.
      </p>
    </Section>
  );
}

// ── Shared chrome ──────────────────────────────────────────────────────────

const plotStyle = {
  background: 'transparent',
  color: INK,
  fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
  fontSize: '11.5px',
  overflow: 'visible',
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{children}</p>
  );
}

function Section({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-12 first:border-0 first:pt-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-1.5 max-w-3xl font-display text-[clamp(21px,3vw,28px)] font-semibold leading-tight text-body">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-subtle">{lede}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function ChartCard({
  title,
  subtitle,
  controls,
  className = '',
  children,
}: {
  title: string;
  subtitle?: string;
  controls?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={`rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5 ${className}`}>
      <figcaption className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold leading-snug text-body">{title}</h3>
          {subtitle && <p className="mt-1 max-w-xl text-[12.5px] leading-snug text-muted">{subtitle}</p>}
        </div>
        {controls}
      </figcaption>
      {children}
    </figure>
  );
}

function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
      {items.map(item => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function Aside({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 border-l-2 border-brand-secondary bg-card/60 py-3 pl-4 pr-3 text-[14.5px] leading-relaxed text-subtle">
      {children}
    </p>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-lg border border-brand-secondary/35 bg-brand-secondary/[0.07] px-4 py-3 text-[14px] leading-relaxed text-subtle">
      <span className="font-semibold text-body">Read this first. </span>
      {children}
    </p>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <p className="border-b border-border bg-card px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <pre className="overflow-x-auto bg-code-bg px-4 py-3.5 text-[12.5px] leading-relaxed text-subtle">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CategoryPicker({
  categories,
  value,
  onChange,
}: {
  categories: CategoryStat[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <label className="flex shrink-0 items-center gap-2 text-[13px] text-muted">
      <span className="font-mono text-[11px] uppercase tracking-wider">Category</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="max-w-[15rem] rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13.5px] text-body shadow-sm transition-colors hover:border-border-strong focus:border-link focus:outline-none"
      >
        <option value={ALL}>All {categories.length} categories</option>
        {categories.map(c => (
          <option key={c.key} value={c.key}>
            {c.label} · {compact(c.n)}
          </option>
        ))}
      </select>
    </label>
  );
}
