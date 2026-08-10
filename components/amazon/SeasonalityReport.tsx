'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChartCard, Legend, Aside, Section, Warning, plotStyle } from './ui';
import { giftGradient, rhythmRows, shares, type RhythmRow } from './derive';
import {
  ACCENT,
  ALL,
  GRID,
  MUTED,
  SURFACE,
  compact,
  int,
  pct,
  signed,
  type AmazonData,
  type Cell,
} from './types';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/**
 * Seasonality across all 33 categories, computed entirely from the published
 * category summaries — no new extraction.
 *
 * The month / weekday / hour files pool every year from 1996 to 2023, which
 * makes them cyclical profiles and not timelines. That constraint is stated
 * once at the top and enforced by never drawing them on a date axis.
 */
export function SeasonalityReport({ data }: { data: AmazonData }) {
  const rows = React.useMemo(() => rhythmRows(data), [data]);
  const grad = React.useMemo(() => giftGradient(rows), [rows]);
  const byAmp = React.useMemo(() => [...rows].sort((a, b) => b.janLift - a.janLift), [rows]);

  return (
    <>
      <Warning>
        Every chart on this page pools all 28 years together. &ldquo;January&rdquo; means every
        January from 1996 to 2023 stacked, not a point on a timeline. Read them as cyclical
        profiles — for the actual time series, see{' '}
        <a
          href="/amazon/growth"
          className="font-medium text-hub-teal underline decoration-hub-teal/40 underline-offset-2"
        >
          the growth analysis
        </a>
        .
      </Warning>

      <TheGiftSeason data={data} rows={byAmp} />
      <NotEveryonePeaksInJanuary data={data} rows={rows} />
      <DecemberBuysJanuaryReceives rows={rows} grad={grad} />
      <TheWeekBarelyMatters data={data} rows={rows} />
      <OneDailyShape data={data} rows={rows} />
    </>
  );
}

// ── §1 The gift season ─────────────────────────────────────────────────────

function TheGiftSeason({ data, rows }: { data: AmazonData; rows: RhythmRow[] }) {
  const monthly = data.series.monthly[ALL];
  const s = shares(monthly).map((v, i) => ({ t: i + 1, share: v * 100, cell: monthly[i] }));
  const top = s.reduce((a, b) => (b.share > a.share ? b : a));
  const low = s.reduce((a, b) => (b.share < a.share ? b : a));
  const lead = rows[0];

  return (
    <Section
      eyebrow="Seasonality"
      title="January is the biggest review month of the year"
      lede={
        <>
          {data.monthNames[top.t - 1]} carries {pct(top.share)} of all reviews against{' '}
          {data.monthNames[low.t - 1]}&rsquo;s {pct(low.share)} — a{' '}
          {(top.share / low.share).toFixed(2)}× swing on {compact(data.meta.totalReviews)} reviews.
          The gift categories drive it, and they drive it hard: {lead.label} posts{' '}
          {lead.janLift.toFixed(2)}× an average month&rsquo;s volume in January.
        </>
      }
    >
      <ChartCard
        title="Share of all reviews by calendar month"
        subtitle="All 33 categories pooled, all years pooled."
      >
        <PlotFigure
          ariaLabel="Bar chart of review share by calendar month across all categories."
          options={width =>
            ({
              width,
              height: 250,
              marginLeft: 46,
              marginBottom: 40,
              style: plotStyle,
              x: { label: null, tickFormat: (i: number) => data.monthNames[i - 1].slice(0, 3) },
              y: { label: '↑ Share of reviews', grid: true, tickFormat: (v: number) => `${v}%` },
              marks: [
                Plot.barY(s, {
                  x: 't',
                  y: 'share',
                  fill: (d: { t: number }) => (d.t === 1 ? ACCENT.amber : ACCENT.blue),
                  fillOpacity: 0.85,
                  tip: true,
                  title: (d: { t: number; share: number; cell: Cell }) =>
                    `${data.monthNames[d.t - 1]}\n${pct(d.share)} of reviews (${int(d.cell.n)})\n${d.cell.r.toFixed(2)}★ mean`,
                }),
                Plot.ruleY([100 / 12], { stroke: MUTED, strokeDasharray: '3,3' }),
                Plot.ruleY([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] text-hub-ink-faint">
          Dashed line is an even {(100 / 12).toFixed(2)}% per month.
        </p>
      </ChartCard>

      <ChartCard
        className="mt-4"
        title="January volume lift, by category"
        subtitle="January's share of a category's reviews divided by its average month. 1.0 means no January effect."
      >
        <PlotFigure
          ariaLabel="Dot plot of January volume lift by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 168,
              marginRight: 40,
              marginBottom: 36,
              style: plotStyle,
              x: { label: 'January lift (× an average month) →', grid: true, domain: [0.7, 2.5] },
              y: { label: null, domain: rows.map(r => r.label) },
              marks: [
                Plot.ruleX([1], { stroke: MUTED, strokeDasharray: '3,3' }),
                Plot.link(rows, {
                  x1: 1,
                  x2: 'janLift',
                  y: 'label',
                  stroke: (d: RhythmRow) => (d.janLift >= 1 ? ACCENT.amber : ACCENT.teal),
                  strokeWidth: 1.5,
                  strokeOpacity: 0.5,
                }),
                Plot.dot(rows, {
                  x: 'janLift',
                  y: 'label',
                  r: 4,
                  fill: (d: RhythmRow) => (d.janLift >= 1 ? ACCENT.amber : ACCENT.teal),
                  tip: true,
                  title: (d: RhythmRow) =>
                    `${d.label}\nJanuary lift ${d.janLift.toFixed(2)}×\npeak ${data.monthNames[d.peakMonth - 1]} · trough ${data.monthNames[d.troughMonth - 1]}\n${int(d.n)} reviews`,
                }),
                Plot.text(rows, {
                  x: 'janLift',
                  y: 'label',
                  text: (d: RhythmRow) => `${d.janLift.toFixed(2)}×`,
                  dx: 10,
                  textAnchor: 'start',
                  fontSize: 10,
                  fill: MUTED,
                }),
              ],
            }) as PlotOptions
          }
        />
        <Legend
          items={[
            { label: 'January above average', color: ACCENT.amber },
            { label: 'January below average', color: ACCENT.teal },
          ]}
        />
      </ChartCard>

      <Aside>
        The ordering is a gift gradient, not a product gradient. Gift Cards, Toys &amp; Games, and
        Video Games sit at the top; Automotive and Patio, Lawn &amp; Garden sit at the bottom. What
        January measures is not when people buy — it is when they finish unwrapping.
      </Aside>
    </Section>
  );
}

// ── §2 The heatmap ─────────────────────────────────────────────────────────

function NotEveryonePeaksInJanuary({ data, rows }: { data: AmazonData; rows: RhythmRow[] }) {
  // Long-form for the heatmap: one record per category-month, indexed so 100 is
  // the category's own average month. Indexing per row is what makes a 67M-review
  // category and a 16K-review category comparable in the same grid.
  const cells = React.useMemo(
    () =>
      rows.flatMap(r =>
        r.monthIndex.map((v, i) => ({
          label: r.label,
          month: i + 1,
          index: v,
          janLift: r.janLift,
        }))
      ),
    [rows]
  );
  const ordered = React.useMemo(
    () => [...rows].sort((a, b) => b.janLift - a.janLift).map(r => r.label),
    [rows]
  );
  const summer = rows.filter(r => r.peakMonth >= 5 && r.peakMonth <= 8);

  return (
    <Section
      eyebrow="Counter-seasonality"
      title="Three categories peak in July instead"
      lede={
        <>
          {summer.map(r => r.label).join(', ')} invert the calendar entirely — their reviews arrive
          in summer, and January is their quietest stretch. Patio, Lawn &amp; Garden runs{' '}
          {rows.find(r => r.key === 'Patio_Lawn_and_Garden')?.janLift.toFixed(2)}× in January, the
          only category below parity. Seasonality here is tracking use, not gifting.
        </>
      }
    >
      <ChartCard
        title="Monthly profile by category"
        subtitle="Each row is indexed to its own average month: 100 = typical, 200 = double. Rows sorted by January lift."
      >
        <PlotFigure
          ariaLabel="Heatmap of monthly review share index by category."
          options={width =>
            ({
              width,
              height: 700,
              marginLeft: width < 560 ? 132 : 172,
              marginTop: 28,
              marginBottom: 10,
              marginRight: 16,
              style: plotStyle,
              x: {
                label: null,
                axis: 'top',
                tickFormat: (i: number) => data.monthNames[i - 1].slice(0, 1),
                tickSize: 0,
              },
              y: { label: null, domain: ordered, tickSize: 0 },
              color: {
                type: 'diverging',
                pivot: 100,
                scheme: 'BrBG',
                reverse: true,
                domain: [55, 245],
                clamp: true,
                legend: true,
                label: 'Share index (100 = category average month)',
              },
              marks: [
                Plot.cell(cells, {
                  x: 'month',
                  y: 'label',
                  fill: 'index',
                  inset: 0.5,
                  tip: true,
                  title: (d: { label: string; month: number; index: number }) =>
                    `${d.label}\n${data.monthNames[d.month - 1]}: index ${Math.round(d.index)}\n(${d.index >= 100 ? '+' : ''}${(d.index - 100).toFixed(0)}% vs its average month)`,
                }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <Aside>
        Read down the January column and the gift categories light up as one block. Read across
        Patio, Lawn &amp; Garden and you get the opposite shape — a summer ridge with a winter
        trough. Both are seasonality; they are seasonality of different things, and a single pooled
        &ldquo;January is busy&rdquo; statistic hides the distinction completely.
      </Aside>
    </Section>
  );
}

// ── §3 The finding ─────────────────────────────────────────────────────────

function DecemberBuysJanuaryReceives({
  rows,
  grad,
}: {
  rows: RhythmRow[];
  grad: ReturnType<typeof giftGradient>;
}) {
  const gc = rows.find(r => r.key === 'Gift_Cards')!;
  const toys = rows.find(r => r.key === 'Toys_and_Games')!;
  const labelled = new Set([
    'Gift_Cards',
    'Toys_and_Games',
    'Video_Games',
    'Patio_Lawn_and_Garden',
    'Kindle_Store',
    'Automotive',
    'Magazine_Subscriptions',
    'Home_and_Kitchen',
  ]);

  return (
    <Section
      eyebrow="The finding"
      title="December buys, January receives"
      id="gift-gradient"
      lede={
        <>
          January is not just the biggest review month — it is also the <em>kindest</em>. Gift Cards
          rate {signed(gc.janMinusDec)} stars higher in January than December, Toys &amp; Games{' '}
          {signed(toys.janMinusDec)}, while the flat, un-gifted categories show essentially nothing.
          Across all 33 categories the January rating premium rises with the January volume spike —
          a rank correlation of {grad.spearman.toFixed(2)}, modest but well outside chance at this
          sample size, and it survives dropping the two most extreme categories.
        </>
      }
    >
      <ChartCard
        title="January volume lift against the January–December rating gap"
        subtitle="One dot per category. The more a category spikes in January, the larger its January rating premium."
        footnote={
          <>
            Spearman ρ = {grad.spearman.toFixed(2)} across all 33 categories, and{' '}
            {grad.spearmanExTop2.toFixed(2)} with Gift Cards and Toys &amp; Games removed. Pearson r
            is {grad.pearson.toFixed(2)} but falls to {grad.pearsonExTop2.toFixed(2)} without those
            two — Gift Cards sits so far right that it carries the linear fit on its own, which is
            why the rank statistic is the one quoted above.
          </>
        }
      >
        <PlotFigure
          ariaLabel="Scatterplot of January volume lift against the January minus December rating gap, by category."
          options={width =>
            ({
              width,
              height: Math.min(440, Math.max(330, width * 0.56)),
              marginLeft: 58,
              marginBottom: 46,
              marginRight: 20,
              style: plotStyle,
              x: { label: 'January volume lift (× average month) →', grid: true },
              y: {
                label: '↑ January ★ − December ★',
                grid: true,
                tickFormat: (v: number) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)),
              },
              r: { range: [3.5, 20] },
              marks: [
                Plot.ruleY([0], { stroke: MUTED, strokeDasharray: '3,3' }),
                Plot.linearRegressionY(rows, {
                  x: 'janLift',
                  y: 'janMinusDec',
                  stroke: ACCENT.teal,
                  strokeOpacity: 0.35,
                  fillOpacity: 0.07,
                }),
                Plot.dot(rows, {
                  x: 'janLift',
                  y: 'janMinusDec',
                  r: 'n',
                  fill: ACCENT.amber,
                  fillOpacity: 0.55,
                  stroke: ACCENT.amber,
                  strokeWidth: 1.2,
                  tip: true,
                  title: (d: RhythmRow) =>
                    `${d.label}\nJanuary lift ${d.janLift.toFixed(2)}×\nJan − Dec rating ${signed(d.janMinusDec, 3)}\n${int(d.n)} reviews`,
                }),
                Plot.text(rows.filter(r => labelled.has(r.key)), {
                  x: 'janLift',
                  y: 'janMinusDec',
                  text: 'label',
                  dy: -13,
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
      </ChartCard>

      <Aside>
        <p>
          The straightforward reading is that <strong>the reviewer changes identity between the two
          months.</strong> December reviews of a gift category are disproportionately written by the
          buyer — about shipping, packaging, whether it arrived in time. January reviews are written
          by the person who received it and has now used it. Buyers rate logistics; recipients rate
          the thing.
        </p>
        <p className="mt-2.5">
          It is a hypothesis, not a result: these aggregates carry no user IDs, so there is no way
          here to confirm that December and January reviewers are different people. What makes it
          more than a story is that the effect scales with gift intensity across 33 independent
          categories rather than showing up in one. Testing it properly needs the reviewer-level
          data, following the same person across December and January.
        </p>
      </Aside>
    </Section>
  );
}

// ── §4 Weekday ─────────────────────────────────────────────────────────────

function TheWeekBarelyMatters({ data, rows }: { data: AmazonData; rows: RhythmRow[] }) {
  const dow = data.series.dayofweek[ALL];
  const s = shares(dow).map((v, i) => ({ t: i, share: v * 100, cell: dow[i] }));
  const hi = s.reduce((a, b) => (b.share > a.share ? b : a));
  const lo = s.reduce((a, b) => (b.share < a.share ? b : a));
  const flattest = [...rows].sort((a, b) => a.weekCV - b.weekCV)[0];
  const peakiest = [...rows].sort((a, b) => b.weekCV - a.weekCV)[0];

  return (
    <Section
      eyebrow="Weekday"
      title="The day of the week is almost irrelevant"
      lede={
        <>
          {data.dayNames[hi.t]} is the busiest day at {pct(hi.share)} and {data.dayNames[lo.t]} the
          quietest at {pct(lo.share)} — a spread of {(hi.share - lo.share).toFixed(1)} points where
          an even split would be {(100 / 7).toFixed(1)}%. Across categories the unevenness ranges
          from {flattest.label} (essentially flat) to {peakiest.label}, and even the extreme is
          small. Writing a review is not a weekend activity, and it is not a lunch-break activity
          either.
        </>
      }
    >
      <ChartCard
        title="Share of all reviews by day of week"
        subtitle="All categories pooled. Note the y-axis starts at 12%, not 0 — the variation is real but small."
      >
        <PlotFigure
          ariaLabel="Bar chart of review share by day of week."
          options={width =>
            ({
              width,
              height: 230,
              marginLeft: 46,
              marginBottom: 40,
              style: plotStyle,
              x: { label: null, tickFormat: (i: number) => data.dayNames[i].slice(0, 3) },
              y: {
                label: '↑ Share',
                grid: true,
                domain: [12, 16],
                tickFormat: (v: number) => `${v}%`,
              },
              marks: [
                // Lollipops: the axis starts at 12% so a 2-point spread is
                // visible at all, which makes bar length meaningless.
                Plot.ruleX(s, {
                  x: 't',
                  y1: 12,
                  y2: 'share',
                  stroke: ACCENT.plum,
                  strokeWidth: 9,
                  strokeOpacity: 0.3,
                }),
                Plot.dot(s, {
                  x: 't',
                  y: 'share',
                  r: 5.5,
                  fill: ACCENT.plum,
                  tip: true,
                  title: (d: { t: number; share: number; cell: Cell }) =>
                    `${data.dayNames[d.t]}\n${pct(d.share)} of reviews (${int(d.cell.n)})\n${d.cell.r.toFixed(2)}★ mean`,
                }),
                Plot.ruleY([100 / 7], { stroke: MUTED, strokeDasharray: '3,3' }),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] text-hub-ink-faint">
          Dashed line is an even {(100 / 7).toFixed(2)}% per day.
        </p>
      </ChartCard>

      <Aside>
        A null result worth publishing. If review-writing were tied to leisure time you would expect
        a weekend ridge; if it were tied to desk-idling you would expect a weekday one. Neither
        shows up at any meaningful size, which is itself evidence about when the activity happens —
        it is prompted by the product arriving, not by the calendar.
      </Aside>
    </Section>
  );
}

// ── §5 Hour of day ─────────────────────────────────────────────────────────

function OneDailyShape({ data, rows }: { data: AmazonData; rows: RhythmRow[] }) {
  const pooled = data.series.hourly[ALL];
  const ps = shares(pooled).map((v, i) => ({ t: i, share: v * 100, cell: pooled[i] }));
  const hi = ps.reduce((a, b) => (b.share > a.share ? b : a));
  const lo = ps.reduce((a, b) => (b.share < a.share ? b : a));

  // Every category's normalised hourly profile, overlaid.
  const overlay = React.useMemo(
    () =>
      data.categories.flatMap(c =>
        shares(data.series.hourly[c.key]).map((v, i) => ({
          label: c.label,
          key: c.key,
          t: i,
          index: v * 24 * 100,
        }))
      ),
    [data]
  );

  const byNight = React.useMemo(() => [...rows].sort((a, b) => b.nightShare - a.nightShare), [rows]);
  const owl = byNight[0];
  const lark = byNight[byNight.length - 1];
  const hourSpread = Math.max(...rows.map(r => r.meanHour)) - Math.min(...rows.map(r => r.meanHour));

  return (
    <Section
      eyebrow="Hour of day"
      title="Every category has the same daily shape"
      lede={
        <>
          Reviews peak at {String(hi.t).padStart(2, '0')}:00 UTC and bottom out at{' '}
          {String(lo.t).padStart(2, '0')}:00 — a {(hi.share / lo.share).toFixed(1)}× swing. All 33
          categories peak in the same hour, and their circular mean hours span just{' '}
          {hourSpread.toFixed(1)} hours. The daily rhythm belongs to the platform and its
          time zones, not to the products.
        </>
      }
    >
      <ChartCard
        title="Hourly profile, all 33 categories overlaid"
        subtitle="Each line is one category, indexed to its own average hour (100 = typical). The pooled profile is drawn heavy."
      >
        <PlotFigure
          ariaLabel="Line chart of hourly review share index for all categories overlaid."
          options={width =>
            ({
              width,
              height: 300,
              marginLeft: 50,
              marginBottom: 40,
              marginRight: 12,
              style: plotStyle,
              x: {
                label: 'Hour (UTC) →',
                domain: [0, 23],
                ticks: [0, 4, 8, 12, 16, 20],
                tickFormat: (v: number) => `${String(v).padStart(2, '0')}:00`,
              },
              y: { label: '↑ Share index (100 = category average hour)', grid: true },
              marks: [
                Plot.ruleY([100], { stroke: MUTED, strokeDasharray: '3,3' }),
                Plot.line(overlay, {
                  x: 't',
                  y: 'index',
                  z: 'key',
                  stroke: ACCENT.blue,
                  strokeOpacity: 0.16,
                  strokeWidth: 1,
                  curve: 'monotone-x',
                }),
                Plot.line(ps.map(d => ({ t: d.t, index: d.share * 24 })), {
                  x: 't',
                  y: 'index',
                  stroke: ACCENT.teal,
                  strokeWidth: 2.4,
                  curve: 'monotone-x',
                }),
                Plot.dot(ps.map(d => ({ ...d, index: d.share * 24 })), {
                  x: 't',
                  y: 'index',
                  r: 2.2,
                  fill: ACCENT.teal,
                  tip: true,
                  title: (d: { t: number; share: number; cell: Cell }) =>
                    `${String(d.t).padStart(2, '0')}:00 UTC — pooled\n${pct(d.share)} of reviews (${int(d.cell.n)})\n${d.cell.r.toFixed(2)}★ mean`,
                }),
              ],
            }) as PlotOptions
          }
        />
        <Legend
          items={[
            { label: 'Individual categories', color: ACCENT.blue },
            { label: 'All categories pooled', color: ACCENT.teal },
          ]}
        />
        <p className="mt-2 text-[12px] leading-snug text-hub-ink-faint">
          The trough at 08:00–09:00 UTC is overnight in North America and the peak at 18:00 is early
          afternoon Eastern — the shape a UTC-stamped, US-heavy corpus produces. The published
          aggregates do not state their timezone, so that is an inference from the shape itself.
        </p>
      </ChartCard>

      <ChartCard
        className="mt-4"
        title="Share of reviews posted 02:00–07:59 UTC"
        subtitle="US late evening. The one place a category-level difference in daily rhythm does show up."
      >
        <PlotFigure
          ariaLabel="Dot plot of late-evening review share by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 36,
              marginBottom: 36,
              style: plotStyle,
              x: { label: 'Share of category reviews, 02:00–07:59 UTC →', grid: true },
              y: { label: null, domain: byNight.map(r => r.label) },
              marks: [
                Plot.barX(byNight, {
                  x: 'nightShare',
                  y: 'label',
                  fill: ACCENT.plum,
                  fillOpacity: 0.75,
                  tip: true,
                  title: (d: RhythmRow) =>
                    `${d.label}\n${pct(d.nightShare)} of reviews 02:00–07:59 UTC\ncircular mean hour ${d.meanHour.toFixed(1)}\n${int(d.n)} reviews`,
                }),
                Plot.text(byNight, {
                  x: 'nightShare',
                  y: 'label',
                  text: (d: RhythmRow) => pct(d.nightShare),
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
        {owl.label} tops the list at {pct(owl.nightShare)} and {lark.label} sits lowest at{' '}
        {pct(lark.nightShare)} — a {(owl.nightShare / lark.nightShare).toFixed(2)}× difference in
        late-evening share. The ordering is roughly leisure-versus-work: Kindle, Software, and Video
        Games skew late, while Office Products, Appliances, and Magazine Subscriptions skew toward
        the working day. Small, but it is the only slice of the daily profile that is about the
        product rather than the platform.
      </Aside>
    </Section>
  );
}
