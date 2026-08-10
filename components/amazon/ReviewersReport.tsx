'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChartCard, Aside, Section, Warning, Legend, plotStyle } from './ui';
import { ACCENT, GRID, MUTED, STARS, SURFACE, compact, int, pct } from './types';
import type { Phase2Meta, Reviewers } from './phase2-types';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/**
 * /amazon/reviewers — the user-grain analysis Phase 1 could not do at all,
 * because it never grouped by reviewer.
 *
 * The through-line: a star rating is partly a measurement of the product and
 * partly a measurement of whoever happened to write it, and the second part is
 * larger than people expect.
 */
export function ReviewersReport({ data, meta }: { data: Reviewers; meta: Phase2Meta }) {
  return (
    <>
      <TheActivityGradient data={data} />
      <WhoWritesThem data={data} />
      <TheHardeningThatIsnt data={data} />
      <HowLongTheyLast data={data} />
      <TheVarianceQuestion data={data} meta={meta} />
    </>
  );
}

// ── §1 The activity gradient ───────────────────────────────────────────────

function TheActivityGradient({ data }: { data: Reviewers }) {
  const one = data.activity.find(a => a.bucket === '1')!;
  const many = data.activity.find(a => a.bucket === '10+')!;
  const total = data.activity.reduce((s, a) => s + a.n, 0);

  // Long form for a stacked bar: activity bucket × star.
  const stack = data.activity.flatMap(a =>
    a.dist.map((share, i) => ({ bucket: a.bucket, star: i + 1, share }))
  );

  return (
    <Section
      eyebrow="Selection"
      title="One-time reviewers give one star 2.5× as often"
      lede={
        <>
          Sort every review by how many its author ever wrote, and the rating climbs monotonically:{' '}
          {one.mean.toFixed(2)}★ from people who reviewed once, {many.mean.toFixed(2)}★ from people
          who reviewed ten times or more. The one-star share falls from {pct(one.dist[0])} to{' '}
          {pct(many.dist[0])} — a factor of {(one.dist[0] / many.dist[0]).toFixed(1)}. Nothing about
          the products changed; only who is holding the pen.
        </>
      }
    >
      <ChartCard
        title="Mean rating by reviewer activity"
        subtitle={`Every one of the ${compact(total)} reviews, bucketed by its author's lifetime review count.`}
      >
        <PlotFigure
          ariaLabel="Bar chart of mean rating by reviewer activity bucket."
          options={width =>
            ({
              width,
              height: 250,
              marginLeft: 52,
              marginBottom: 44,
              style: plotStyle,
              x: { label: 'Reviews written by this author →', domain: data.activity.map(a => a.bucket) },
              y: { label: '↑ Mean ★', grid: true, domain: [3.6, 4.4] },
              marks: [
                Plot.barY(data.activity, {
                  x: 'bucket',
                  y: 'mean',
                  fill: ACCENT.blue,
                  fillOpacity: 0.85,
                  tip: true,
                  title: (d: (typeof data.activity)[number]) =>
                    `${d.bucket} review${d.bucket === '1' ? '' : 's'}\n${d.mean.toFixed(3)}★ mean\n${pct(d.dist[0])} one-star · ${pct(d.dist[4])} five-star\n${int(d.n)} reviews`,
                }),
                Plot.text(data.activity, {
                  x: 'bucket',
                  y: 'mean',
                  text: (d: (typeof data.activity)[number]) => d.mean.toFixed(2),
                  dy: -8,
                  fontSize: 11,
                  fill: MUTED,
                }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <ChartCard
        className="mt-4"
        title="Full rating distribution by reviewer activity"
        subtitle="The gradient is not a shift in the mean — it is the one-star block shrinking."
      >
        <PlotFigure
          ariaLabel="Stacked bar chart of rating distribution by reviewer activity."
          options={width =>
            ({
              width,
              height: 250,
              marginLeft: 52,
              marginBottom: 44,
              style: plotStyle,
              x: { label: 'Reviews written by this author →', domain: data.activity.map(a => a.bucket) },
              y: { label: '↑ Share of reviews', grid: true, tickFormat: (v: number) => `${v}%` },
              color: { domain: [1, 2, 3, 4, 5], range: STARS },
              marks: [
                Plot.barY(stack, {
                  x: 'bucket',
                  y: 'share',
                  fill: 'star',
                  order: 'sum',
                  stroke: SURFACE,
                  strokeWidth: 0.5,
                  tip: true,
                  title: (d: { bucket: string; star: number; share: number }) =>
                    `${d.bucket} · ${d.star}★\n${pct(d.share)} of their reviews`,
                }),
                Plot.ruleY([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
        <Legend items={STARS.map((c, i) => ({ label: `${i + 1}★`, color: c }))} />
      </ChartCard>

      <Warning label="This is why the corpus mean is an upper bound.">
        The <code className="font-plex text-[12.5px]">Unknown</code> category is excluded from every
        published figure — 11% of ratings, but <strong>42% of users</strong>, and disproportionately
        one-and-done. Since sparse reviewers rate lower, dropping them pushes every mean rating up.
        The direction was previously an assertion; this chart is what quantifies it.
      </Warning>
    </Section>
  );
}

// ── §2 Concentration ───────────────────────────────────────────────────────

function WhoWritesThem({ data }: { data: Reviewers }) {
  const g = data.global;
  const byGini = [...data.perCategory].sort((a, b) => b.gini - a.gini);

  return (
    <Section
      eyebrow="Concentration"
      title="Half the reviews come from a tenth of the reviewers"
      lede={
        <>
          {compact(g.users)} reviewers wrote {compact(g.reviews)} reviews — {g.perUser} each on
          average, which describes almost nobody. The top 10% wrote {pct(g.top10)} of everything and
          the top 1% wrote {pct(g.top1)}, for a Gini of {g.gini.toFixed(3)}. That is more unequal
          than most countries&rsquo; income distributions.
        </>
      }
    >
      <ChartCard
        title="Lorenz curve — reviewers against reviews"
        subtitle="Cumulative share of reviews held by the least-active reviewers, ordered by activity. The diagonal is perfect equality."
      >
        <PlotFigure
          ariaLabel="Lorenz curve of review concentration across reviewers."
          options={width =>
            ({
              width,
              height: Math.min(420, Math.max(300, width * 0.5)),
              marginLeft: 54,
              marginBottom: 46,
              style: plotStyle,
              x: {
                label: 'Cumulative share of reviewers →',
                grid: true,
                domain: [0, 1],
                tickFormat: (v: number) => `${Math.round(v * 100)}%`,
              },
              y: {
                label: '↑ Cumulative share of reviews',
                grid: true,
                domain: [0, 1],
                tickFormat: (v: number) => `${Math.round(v * 100)}%`,
              },
              marks: [
                Plot.line(
                  [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                  ],
                  { x: 'x', y: 'y', stroke: MUTED, strokeDasharray: '4,4' }
                ),
                Plot.areaY(data.curve, {
                  x: 'users',
                  y: 'reviews',
                  fill: ACCENT.blue,
                  fillOpacity: 0.12,
                  curve: 'monotone-x',
                }),
                Plot.line(data.curve, {
                  x: 'users',
                  y: 'reviews',
                  stroke: ACCENT.blue,
                  strokeWidth: 2.2,
                  curve: 'monotone-x',
                }),
                Plot.dot(data.curve, {
                  x: 'users',
                  y: 'reviews',
                  r: 1.8,
                  fill: ACCENT.blue,
                  tip: true,
                  title: (d: (typeof data.curve)[number]) =>
                    `up to ${d.perUser} review${d.perUser === 1 ? '' : 's'} each\n${pct(d.users * 100)} of reviewers\n${pct(d.reviews * 100)} of reviews`,
                }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <ChartCard
        className="mt-4"
        title="Reviewer inequality by category"
        subtitle="Gini of reviews-per-reviewer, within each category."
      >
        <PlotFigure
          ariaLabel="Dot plot of reviewer Gini by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 52,
              marginBottom: 36,
              style: plotStyle,
              x: { label: 'Gini of reviews per reviewer →', grid: true },
              y: { label: null, domain: byGini.map(c => c.label) },
              marks: [
                Plot.ruleX([g.gini], { stroke: MUTED, strokeDasharray: '3,3' }),
                Plot.barX(byGini, {
                  x: 'gini',
                  y: 'label',
                  fill: ACCENT.plum,
                  fillOpacity: 0.75,
                  tip: true,
                  title: (d: (typeof byGini)[number]) =>
                    `${d.label}\nGini ${d.gini.toFixed(3)}\ntop 1% wrote ${pct(d.top1)} · top 10% wrote ${pct(d.top10)}\n${int(d.users)} reviewers · ${int(d.reviews)} reviews`,
                }),
                Plot.text(byGini, {
                  x: 'gini',
                  y: 'label',
                  text: (d: (typeof byGini)[number]) => d.gini.toFixed(2),
                  dx: 6,
                  textAnchor: 'start',
                  fontSize: 10,
                  fill: MUTED,
                }),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] text-hub-ink-faint">
          Dashed line is the corpus-wide Gini ({g.gini.toFixed(3)}). Per-category Ginis count only a
          reviewer&rsquo;s reviews <em>inside</em> that category, so they are not comparable to the
          global figure — a generalist looks like a novice in every category they touch.
        </p>
      </ChartCard>
    </Section>
  );
}

// ── §3 Rating by review index ──────────────────────────────────────────────

function TheHardeningThatIsnt({ data }: { data: Reviewers }) {
  const first = data.globalIndex.find(x => x.i === 1);
  const tenth = data.globalIndex.find(x => x.i === 10);

  return (
    <Section
      eyebrow="Experience"
      title="Reviewers get kinder, not harsher — probably"
      lede={
        <>
          Conventional wisdom says critics harden with practice. The curve says the opposite: a
          reviewer&rsquo;s first review averages {first?.r.toFixed(3)}★ and their tenth{' '}
          {tenth?.r.toFixed(3)}★. But read the caveat below before believing it — this particular
          chart has survivorship built into its x-axis.
        </>
      }
    >
      <ChartCard
        title="Mean rating at a reviewer's nth review"
        subtitle="Pooled across all reviewers who reached that many reviews."
      >
        <PlotFigure
          ariaLabel="Line chart of mean rating by reviewer review index."
          options={width =>
            ({
              width,
              height: 260,
              marginLeft: 54,
              marginBottom: 42,
              marginRight: 14,
              style: plotStyle,
              x: { label: "Reviewer's nth review →", grid: true },
              y: { label: '↑ Mean ★', grid: true },
              marks: [
                Plot.areaY(data.globalIndex, {
                  x: 'i',
                  y: 'r',
                  y1: Math.min(...data.globalIndex.map(x => x.r)) - 0.02,
                  fill: ACCENT.teal,
                  fillOpacity: 0.12,
                  curve: 'monotone-x',
                }),
                Plot.line(data.globalIndex, {
                  x: 'i',
                  y: 'r',
                  stroke: ACCENT.teal,
                  strokeWidth: 2.2,
                  curve: 'monotone-x',
                }),
                Plot.dot(data.globalIndex, {
                  x: 'i',
                  y: 'r',
                  r: 2.4,
                  fill: ACCENT.teal,
                  tip: true,
                  title: (d: { i: number; n: number; r: number }) =>
                    `review #${d.i}\n${d.r.toFixed(3)}★\n${int(d.n)} reviewers reached this point`,
                }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <Aside>
        <p>
          <strong className="font-semibold text-hub-ink">The x-axis is not a clean treatment.</strong>{' '}
          Everyone appears at review #1; only people who kept going appear at #10. Since the previous
          section showed that prolific reviewers rate higher <em>as a population</em>, most of this
          rise is composition — the harsh one-and-done reviewers dropping out of the sample — not
          individuals mellowing.
        </p>
        <p className="mt-2.5">
          Separating the two needs a within-reviewer comparison: the same person&rsquo;s first review
          against their tenth. These aggregates cannot do it, and it is the single most valuable thing
          a Phase 3 would add. Read the curve as an upper bound on any real learning effect.
        </p>
      </Aside>
    </Section>
  );
}

// ── §4 Tenure ──────────────────────────────────────────────────────────────

function HowLongTheyLast({ data }: { data: Reviewers }) {
  const total = data.tenure.reduce((s, t) => s + t.users, 0);
  const sameDay = data.tenure.find(t => t.days === 0);
  const longest = data.tenure[data.tenure.length - 1];
  const totalReviews = data.tenure.reduce((s, t) => s + t.reviews, 0);

  const rows = data.tenure.map(t => ({
    ...t,
    userShare: (100 * t.users) / total,
    reviewShare: (100 * t.reviews) / totalReviews,
    band:
      t.days === 0
        ? 'same day'
        : t.days === 1
          ? '1 day'
          : t.days < 365
            ? `${t.days} days`
            : `${Math.round(t.days / 365)} year${t.days >= 730 ? 's' : ''}+`,
  }));

  return (
    <Section
      eyebrow="Tenure"
      title="A quarter of reviewers exist for a single day"
      lede={
        <>
          {pct((100 * (sameDay?.users ?? 0)) / total)} of reviewers have a first and last review on
          the same date — they arrived, said something, and never came back. At the other end,
          reviewers whose span exceeds five years are {pct((100 * longest.users) / total)} of the
          population and {pct((100 * longest.reviews) / totalReviews)} of the reviews.
        </>
      }
    >
      <ChartCard
        title="Reviewers and reviews by tenure span"
        subtitle="Tenure is last review minus first review. Buckets are lower bounds."
      >
        <PlotFigure
          ariaLabel="Grouped bar chart of reviewer and review share by tenure bucket."
          options={width =>
            ({
              width,
              height: 280,
              marginLeft: 54,
              marginBottom: 48,
              style: plotStyle,
              // Grouped bars via faceting: fx is the tenure band, x the series
              // within it. Plot has no per-datum bar offset, so this is the
              // idiomatic way to put two bars side by side.
              fx: { label: 'Tenure span →', domain: rows.map(r => r.band) },
              x: { axis: null, domain: ['reviewers', 'reviews'] },
              y: { label: '↑ Share', grid: true, tickFormat: (v: number) => `${v}%` },
              color: { domain: ['reviewers', 'reviews'], range: [ACCENT.blue, ACCENT.amber], legend: true },
              marks: [
                Plot.barY(
                  rows.flatMap(r => [
                    { band: r.band, kind: 'reviewers', v: r.userShare, users: r.users, reviews: r.reviews },
                    { band: r.band, kind: 'reviews', v: r.reviewShare, users: r.users, reviews: r.reviews },
                  ]),
                  {
                    fx: 'band',
                    x: 'kind',
                    y: 'v',
                    fill: 'kind',
                    fillOpacity: 0.85,
                    tip: true,
                    title: (d: { band: string; kind: string; v: number; users: number; reviews: number }) =>
                      `${d.band}\n${pct(d.v)} of ${d.kind}\n${int(d.users)} reviewers · ${int(d.reviews)} reviews`,
                  }
                ),
                Plot.ruleY([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <Aside>
        The two bars diverge sharply, and that divergence is the whole point: the reviewer population
        is dominated by people who barely participate, while the review <em>corpus</em> is dominated
        by people who never stopped. Any statement about &ldquo;what reviewers think&rdquo; has to
        pick which of those two populations it means.
      </Aside>
    </Section>
  );
}

// ── §5 Variance ────────────────────────────────────────────────────────────

function TheVarianceQuestion({ data, meta }: { data: Reviewers; meta: Phase2Meta }) {
  const user = data.variance.find(v => v.factor === 'user');
  const item = data.variance.find(v => v.factor === 'item');
  const cat = data.variance.find(v => v.factor === 'category');
  const sum = meta.varianceTotals.naiveSumPct;

  return (
    <Section
      eyebrow="Variance"
      title="The rater explains more than the product — with a large asterisk"
      lede={
        <>
          Taken one at a time, knowing <em>who wrote</em> a review accounts for{' '}
          {pct(user?.marginalPct ?? 0)} of the variance in star ratings; knowing <em>which product</em>{' '}
          it is about accounts for {pct(item?.marginalPct ?? 0)}; knowing the category accounts for{' '}
          {pct(cat?.marginalPct ?? 0)}. The ordering is the finding. The percentages are not a
          decomposition, and cannot be read as one.
        </>
      }
    >
      <ChartCard
        title="Marginal variance explained, by factor"
        subtitle={`Each bar is that factor alone. They overlap heavily and sum to ${sum?.toFixed(1)}%, which partitions nothing.`}
      >
        <PlotFigure
          ariaLabel="Bar chart of marginal variance explained by user, item, and category."
          options={width =>
            ({
              width,
              height: 200,
              marginLeft: 84,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Marginal variance explained →', grid: true, domain: [0, 35], tickFormat: (v: number) => `${v}%` },
              y: { label: null, domain: ['user', 'item', 'category'] },
              marks: [
                Plot.barX(data.variance, {
                  x: 'marginalPct',
                  y: 'factor',
                  fill: (d: (typeof data.variance)[number]) =>
                    d.factor === 'user' ? ACCENT.plum : d.factor === 'item' ? ACCENT.blue : ACCENT.teal,
                  fillOpacity: 0.85,
                  tip: true,
                  title: (d: (typeof data.variance)[number]) =>
                    `${d.factor}\n${pct(d.marginalPct)} marginal\n${int(d.groups)} groups · ${pct(d.singletonPct)} of them singletons\n(computed from the ${d.from} partitioning)`,
                }),
                Plot.text(data.variance, {
                  x: 'marginalPct',
                  y: 'factor',
                  text: (d: (typeof data.variance)[number]) => pct(d.marginalPct),
                  dx: 6,
                  textAnchor: 'start',
                  fontSize: 11,
                  fill: MUTED,
                }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <Warning label="Not a variance decomposition.">
        User and item effects are crossed and unbalanced, so their sums of squares share variance
        rather than partitioning it. On complete Gift Cards data the same three marginals sum to{' '}
        <strong>105.62%</strong> — impossible for an orthogonal decomposition. Do not compute a
        residual from these numbers, and do not read them as &ldquo;{pct(user?.marginalPct ?? 0)} is
        the rater, {pct(item?.marginalPct ?? 0)} is the product.&rdquo; A further caveat travels with
        the item figure: {pct(item?.singletonPct ?? 0)} of items have exactly one review, and a group
        of one explains its own variance by construction.
      </Warning>

      <Aside>
        This measure was originally specified as a per-category variance decomposition, to be read as
        an index of taste-driven versus quality-driven markets. It does not survive contact with the
        data, and the pipeline was right to publish marginals with a warning instead of a partition
        that does not exist. What remains is still worth knowing — the rater term is larger than the
        product term, consistently — but a genuine decomposition needs a crossed random-effects
        model, not sums of squares.
      </Aside>
    </Section>
  );
}
