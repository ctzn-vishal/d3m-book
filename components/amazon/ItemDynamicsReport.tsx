'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChartCard, Aside, Section, plotStyle } from './ui';
import { ACCENT, GRID, MUTED, STARS, SURFACE, compact, int, pct, signed } from './types';
import type { ItemDynamics } from './phase2-types';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/** Categories where quality is hard to judge before buying (Nelson's split). */
const EXPERIENCE = new Set([
  'Books',
  'Kindle_Store',
  'CDs_and_Vinyl',
  'Digital_Music',
  'Movies_and_TV',
  'Video_Games',
  'Beauty_and_Personal_Care',
  'All_Beauty',
  'Grocery_and_Gourmet_Food',
  'Handmade_Products',
  'Subscription_Boxes',
]);

/**
 * /amazon/item-dynamics — how an item's rating accumulates.
 *
 * This is where the herding hypothesis gets tested: if later reviewers anchor on
 * what came before, the rating-by-index curve should drift and the first-review
 * effect should be large. One of those turns out to be true.
 */
export function ItemDynamicsReport({ data }: { data: ItemDynamics }) {
  return (
    <>
      <NoHerdingInTheAggregate data={data} />
      <TheFirstReviewEffect data={data} />
      <ContestedProducts data={data} />
      <TheVelocityCurve data={data} />
    </>
  );
}

// ── §1 Rating by review index ──────────────────────────────────────────────

function NoHerdingInTheAggregate({ data }: { data: ItemDynamics }) {
  const p = data.pooledIndex;
  const first = p.find(x => x.i === 1)!;
  const peak = p.reduce((a, b) => (b.r > a.r ? b : a));
  const last = p[p.length - 1];
  const span = Math.max(...p.map(x => x.r)) - Math.min(...p.map(x => x.r));

  return (
    <Section
      eyebrow="Herding"
      title="A product's rating barely moves as reviews pile up"
      lede={
        <>
          If later reviewers anchored on earlier ones, the mean rating at an item&rsquo;s nth review
          would drift. It does not. Across all {compact(p.reduce((s, x) => s + x.n, 0))} reviews the
          curve runs from {first.r.toFixed(3)}★ at the first review to a peak of {peak.r.toFixed(3)}★
          at #{peak.i} and {last.r.toFixed(3)}★ by #{last.i} — a total span of {span.toFixed(3)}
          stars. The first review is the outlier, and it is slightly <em>harsher</em> than what
          follows.
        </>
      }
    >
      <ChartCard
        title="Mean rating at an item's nth review"
        subtitle="Pooled across all 33 categories. Note the y-axis spans 0.04 stars — this is a flat line, drawn honestly."
      >
        <PlotFigure
          ariaLabel="Line chart of mean rating by item review index."
          options={width =>
            ({
              width,
              height: 260,
              marginLeft: 58,
              marginBottom: 42,
              marginRight: 14,
              style: plotStyle,
              x: { label: "Item's nth review →", grid: true },
              y: { label: '↑ Mean ★', grid: true },
              marks: [
                Plot.line(p, { x: 'i', y: 'r', stroke: ACCENT.blue, strokeWidth: 2.2, curve: 'monotone-x' }),
                Plot.dot(p, {
                  x: 'i',
                  y: 'r',
                  r: 2.4,
                  fill: ACCENT.blue,
                  tip: true,
                  title: (d: { i: number; n: number; r: number }) =>
                    `review #${d.i}\n${d.r.toFixed(3)}★\n${int(d.n)} reviews at this position`,
                }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <ChartCard
        className="mt-4"
        title="Drift per review, by category"
        subtitle="Slope of mean rating against review index over positions 2–20. Negative means later reviews run cooler."
      >
        <PlotFigure
          ariaLabel="Dot plot of rating drift slope by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 56,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Stars per additional review →', grid: true },
              y: { label: null, domain: data.indexSlopes.map(s => s.label) },
              marks: [
                Plot.ruleX([0], { stroke: MUTED }),
                Plot.link(data.indexSlopes, {
                  x1: 0,
                  x2: 'slope',
                  y: 'label',
                  stroke: (d: (typeof data.indexSlopes)[number]) =>
                    d.slope < 0 ? ACCENT.amber : ACCENT.teal,
                  strokeWidth: 1.5,
                  strokeOpacity: 0.5,
                }),
                Plot.dot(data.indexSlopes, {
                  x: 'slope',
                  y: 'label',
                  r: 4,
                  fill: (d: (typeof data.indexSlopes)[number]) =>
                    d.slope < 0 ? ACCENT.amber : ACCENT.teal,
                  tip: true,
                  title: (d: (typeof data.indexSlopes)[number]) =>
                    `${d.label}\n${signed(d.slope, 4)} stars per review\nfirst review averaged ${d.first?.toFixed(3) ?? '—'}★`,
                }),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] leading-snug text-hub-ink-faint">
          Even the extremes are tiny — a hundredth of a star per review at most. Whatever social
          influence exists between Amazon reviewers, it does not show up as drift in the mean.
        </p>
      </ChartCard>
    </Section>
  );
}

// ── §2 First-review effect ─────────────────────────────────────────────────

function TheFirstReviewEffect({ data }: { data: ItemDynamics }) {
  const lo = data.firstEffect.find(f => f.firstRating === 1)!;
  const hi = data.firstEffect.find(f => f.firstRating === 5)!;
  const withTag = data.firstEffectByCategory.map(c => ({ ...c, exp: EXPERIENCE.has(c.key) }));
  const expMean =
    withTag.filter(c => c.exp).reduce((s, c) => s + c.gap, 0) / withTag.filter(c => c.exp).length;
  const searchMean =
    withTag.filter(c => !c.exp).reduce((s, c) => s + c.gap, 0) / withTag.filter(c => !c.exp).length;

  return (
    <Section
      eyebrow="The finding"
      title="The first review predicts everything after it"
      lede={
        <>
          Condition on what an item&rsquo;s <em>first</em> reviewer said, then look only at reviews
          two onward. Items that opened with 1★ average {lo.later.toFixed(3)}★ thereafter; items that
          opened with 5★ average {hi.later.toFixed(3)}★. That is a gap of{' '}
          {(hi.later - lo.later).toFixed(3)} stars that persists across every subsequent review — and
          unlike the flat curve above, it is enormous.
        </>
      }
    >
      <ChartCard
        title="Mean of reviews 2–n, by what the first review said"
        subtitle="Pooled across all categories. Each bar conditions on the first rating only."
      >
        <PlotFigure
          ariaLabel="Bar chart of later-review mean rating conditioned on the first rating."
          options={width =>
            ({
              width,
              height: 260,
              marginLeft: 56,
              marginBottom: 46,
              style: plotStyle,
              x: { label: 'What the first review said →', domain: [1, 2, 3, 4, 5], tickFormat: (d: number) => `${d}★` },
              y: { label: '↑ Mean ★ of reviews 2–n', grid: true, domain: [3.5, 4.4] },
              marks: [
                Plot.barY(data.firstEffect, {
                  x: 'firstRating',
                  y: 'later',
                  fill: (d: { firstRating: number }) => STARS[d.firstRating - 1],
                  fillOpacity: 0.9,
                  tip: true,
                  title: (d: { firstRating: number; n: number; later: number }) =>
                    `first review ${d.firstRating}★\nlater reviews average ${d.later.toFixed(3)}★\n${int(d.n)} later reviews`,
                }),
                Plot.text(data.firstEffect, {
                  x: 'firstRating',
                  y: 'later',
                  text: (d: { later: number }) => d.later.toFixed(2),
                  dy: -8,
                  fontSize: 11,
                  fill: MUTED,
                }),
                Plot.ruleY([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <Aside>
        <p>
          <strong className="font-semibold text-hub-ink">This is not proof of herding.</strong> An
          item whose first review was one star is probably a worse item — the first review is
          measuring quality, not creating it. Separating the two needs something these aggregates
          cannot supply: variation in the first review that is unrelated to the product, such as
          review timing or reviewer identity.
        </p>
        <p className="mt-2.5">
          What the data <em>can</em> do is show the effect is not a small-category artifact. Among
          the 18 categories with more than 5M conditioned reviews the gap ranges from 0.40 to 0.66
          stars — consistent everywhere, never absent.
        </p>
      </Aside>

      <ChartCard
        className="mt-6"
        title="First-review gap by category"
        subtitle="Mean of reviews 2–n after a 5★ opener, minus the same after a 1★ opener. Experience goods in amber."
      >
        <PlotFigure
          ariaLabel="Dot plot of the first-review gap by category, split by search versus experience goods."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 50,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Gap in stars (5★ opener − 1★ opener) →', grid: true, domain: [0, 0.85] },
              y: { label: null, domain: withTag.map(c => c.label) },
              r: { range: [3, 12] },
              marks: [
                Plot.ruleX([expMean], { stroke: ACCENT.amber, strokeDasharray: '3,3' }),
                Plot.ruleX([searchMean], { stroke: ACCENT.blue, strokeDasharray: '3,3' }),
                Plot.dot(withTag, {
                  x: 'gap',
                  y: 'label',
                  r: 'n',
                  fill: (d: (typeof withTag)[number]) => (d.exp ? ACCENT.amber : ACCENT.blue),
                  fillOpacity: 0.6,
                  stroke: (d: (typeof withTag)[number]) => (d.exp ? ACCENT.amber : ACCENT.blue),
                  tip: true,
                  title: (d: (typeof withTag)[number]) =>
                    `${d.label}\ngap ${d.gap.toFixed(3)} stars\nafter 1★ opener: ${d.after1.toFixed(3)}★\nafter 5★ opener: ${d.after5.toFixed(3)}★\n${int(d.n)} conditioned reviews`,
                }),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] leading-snug text-hub-ink-faint">
          Dashed lines are the unweighted means for each group: {expMean.toFixed(3)} for experience
          goods, {searchMean.toFixed(3)} for search goods. Dot size is the number of conditioned
          reviews — the extremes at the top of the chart are the smallest categories, so read the
          ordering with that in mind.
        </p>
      </ChartCard>

      <Aside>
        I predicted before seeing this that herding would be strongest where quality is hard to judge
        before buying — books and beauty over tools and electronics. The split is{' '}
        {expMean > searchMean ? 'in that direction' : 'against that prediction'} but small (
        {expMean.toFixed(3)} versus {searchMean.toFixed(3)}) and the within-group spread swamps it.
        On this evidence, Nelson&rsquo;s search/experience distinction does not organise the
        first-review effect. Category size predicts the gap better than category type does, which is
        usually a sign you are looking at estimator noise rather than a behavioural difference.
      </Aside>
    </Section>
  );
}

// ── §3 Contested products ──────────────────────────────────────────────────

function ContestedProducts({ data }: { data: ItemDynamics }) {
  const cells = data.meanSd;
  const totalItems = cells.reduce((s, c) => s + c.items, 0);
  // Items rated around 3 stars, split by whether raters agreed.
  const mid = cells.filter(c => c.mean >= 2.5 && c.mean <= 3.5);
  const midItems = mid.reduce((s, c) => s + c.items, 0);
  const contested = mid.filter(c => c.sd >= 1.8).reduce((s, c) => s + c.items, 0);

  return (
    <Section
      eyebrow="Disagreement"
      title="Two ways to be a three-star product"
      lede={
        <>
          A mean rating hides whether raters agreed. Of the {compact(midItems)} items averaging
          between 2.5 and 3.5 stars, {pct((100 * contested) / midItems)} have a standard deviation
          above 1.8 — those are not mediocre products, they are contested ones, loved and hated in
          roughly equal measure. Plotting mean against spread separates the two populations that a
          single number merges.
        </>
      }
    >
      <ChartCard
        title="Items by mean rating and rating spread"
        subtitle={`${compact(totalItems)} items with at least two reviews, binned. Colour is item count on a log scale.`}
      >
        <PlotFigure
          ariaLabel="Heatmap of items by mean rating and standard deviation."
          options={width =>
            ({
              width,
              height: Math.min(460, Math.max(340, width * 0.55)),
              marginLeft: 56,
              marginBottom: 46,
              marginRight: 12,
              style: plotStyle,
              x: { label: 'Item mean rating →', grid: true, domain: [1, 5] },
              y: { label: '↑ Standard deviation of its ratings', grid: true },
              color: {
                type: 'log',
                scheme: 'YlGnBu',
                label: 'Items',
                legend: true,
              },
              marks: [
                Plot.rect(cells, {
                  x: 'mean',
                  y: 'sd',
                  interval: 0.1,
                  fill: 'items',
                  tip: true,
                  title: (d: { mean: number; sd: number; items: number }) =>
                    `mean ${d.mean.toFixed(1)}★ · sd ${d.sd.toFixed(1)}\n${int(d.items)} items`,
                }),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] leading-snug text-hub-ink-faint">
          The bright ridge along the bottom-right is the ordinary case: high mean, low disagreement.
          The arm reaching up and left is the contested population. The hard diagonal edge on the
          left is arithmetic, not behaviour — an item averaging 1.2 stars cannot have a spread of 2.
        </p>
      </ChartCard>

      <ChartCard
        className="mt-4"
        title="Review concentration across items"
        subtitle="Gini of reviews-per-item within each category. Higher means a few products absorb most of the attention."
      >
        <PlotFigure
          ariaLabel="Bar chart of item review-count Gini by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 50,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Gini of reviews per item →', grid: true },
              y: { label: null, domain: data.gini.map(g => g.label) },
              marks: [
                Plot.barX(data.gini, {
                  x: 'gini',
                  y: 'label',
                  fill: ACCENT.plum,
                  fillOpacity: 0.75,
                  tip: true,
                  title: (d: (typeof data.gini)[number]) => `${d.label}\nGini ${d.gini.toFixed(3)}`,
                }),
                Plot.text(data.gini, {
                  x: 'gini',
                  y: 'label',
                  text: (d: (typeof data.gini)[number]) => d.gini.toFixed(2),
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

// ── §4 Velocity ────────────────────────────────────────────────────────────

function TheVelocityCurve({ data }: { data: ItemDynamics }) {
  const v = data.velocityFull;
  const w0 = v.find(x => x.w === 0);
  const total = v.reduce((s, x) => s + x.n, 0);
  const firstMonth = v.filter(x => x.w <= 4).reduce((s, x) => s + x.n, 0);
  const firstYear = v.filter(x => x.w <= 52).reduce((s, x) => s + x.n, 0);

  return (
    <Section
      eyebrow="Lifecycle"
      title="A product's reviews arrive early or never"
      lede={
        <>
          Measured in weeks since an item&rsquo;s first review, {pct((100 * (w0?.n ?? 0)) / total)} of
          all reviews land in week zero and {pct((100 * firstMonth) / total)} within the first month.
          By the end of the first year the item has collected {pct((100 * firstYear) / total)} of the
          reviews it will ever get in this window. Attention decays fast, and it does not come back.
        </>
      }
    >
      <ChartCard
        title="Reviews by weeks since the item's first review"
        subtitle="First two years, all categories pooled. Log y-axis — the decay spans three orders of magnitude."
      >
        <PlotFigure
          ariaLabel="Line chart of review volume by weeks since first review."
          options={width =>
            ({
              width,
              height: 280,
              marginLeft: 62,
              marginBottom: 44,
              marginRight: 14,
              style: plotStyle,
              x: { label: 'Weeks since first review →', grid: true },
              y: { label: '↑ Reviews', grid: true, type: 'log', tickFormat: (d: number) => compact(d) },
              marks: [
                Plot.line(v, { x: 'w', y: 'n', stroke: ACCENT.teal, strokeWidth: 2, curve: 'monotone-x' }),
                Plot.dot(v.filter(x => x.w % 4 === 0), {
                  x: 'w',
                  y: 'n',
                  r: 2.4,
                  fill: ACCENT.teal,
                  tip: true,
                  title: (d: { w: number; n: number }) =>
                    `week ${d.w}\n${int(d.n)} reviews\n${pct((100 * d.n) / total)} of the window`,
                }),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] leading-snug text-hub-ink-faint">
          Week zero is a spike rather than a point on the curve: it contains every review posted in
          the same week as the item&rsquo;s first, which for many items is the only week they ever
          get reviewed.
        </p>
      </ChartCard>
    </Section>
  );
}
