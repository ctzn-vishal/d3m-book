'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChartCard, Aside, Section, Warning, plotStyle } from './ui';
import { ACCENT, GRID, MUTED, compact, int, pct } from './types';
import type { Catalogue } from './phase2-types';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/**
 * /amazon/catalogue — the item side: prices, brands, attribute vocabulary.
 *
 * Also the honest home for the two measures this corpus cannot answer. A page
 * that only shows what worked misrepresents the dataset.
 */
export function CatalogueReport({ data }: { data: Catalogue }) {
  return (
    <>
      <ThePriceProblem data={data} />
      <BrandConcentration data={data} />
      <TheAttributeVocabulary data={data} />
      <WhatTheCorpusCannotSay data={data} />
    </>
  );
}

// ── §1 Prices ──────────────────────────────────────────────────────────────

function ThePriceProblem({ data }: { data: Catalogue }) {
  const p = data.price;
  const nulls = [...p].sort((a, b) => a.nullPct - b.nullPct);
  const medianNull = nulls[Math.floor(nulls.length / 2)].nullPct;
  const best = nulls[0];
  const worst = nulls[nulls.length - 1];

  // Decile ribbon: p10/p50/p90 per category, ordered by median.
  const rows = p.filter(c => c.deciles[4] != null);

  return (
    <Section
      eyebrow="Prices"
      title="Price is missing more often than it is present"
      lede={
        <>
          Before any price chart: the median category is {pct(medianNull)} null. Coverage runs from{' '}
          {pct(best.nullPct)} missing in {best.label} to {pct(worst.nullPct)} in {worst.label}. Every
          decile below is computed on the minority of items that carry a price, and there is no reason
          to think that minority is a random sample of the shelf.
        </>
      }
    >
      <ChartCard
        title="Price missingness by category"
        subtitle="Share of items with no price in the metadata."
      >
        <PlotFigure
          ariaLabel="Bar chart of price missingness by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 54,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Share of items with no price →', grid: true, domain: [0, 100], tickFormat: (v: number) => `${v}%` },
              y: { label: null, domain: [...p].sort((a, b) => b.nullPct - a.nullPct).map(c => c.label) },
              marks: [
                Plot.ruleX([medianNull], { stroke: MUTED, strokeDasharray: '3,3' }),
                Plot.barX(p, {
                  x: 'nullPct',
                  y: 'label',
                  fill: (d: (typeof p)[number]) => (d.nullPct > 50 ? ACCENT.amber : ACCENT.blue),
                  fillOpacity: 0.8,
                  tip: true,
                  title: (d: (typeof p)[number]) =>
                    `${d.label}\n${pct(d.nullPct)} of ${int(d.items)} items have no price\nmedian price where present: ${d.deciles[4] != null ? '$' + d.deciles[4] : '—'}`,
                }),
                Plot.text(p, {
                  x: 'nullPct',
                  y: 'label',
                  text: (d: (typeof p)[number]) => pct(d.nullPct, 0),
                  dx: 6,
                  textAnchor: 'start',
                  fontSize: 10,
                  fill: MUTED,
                }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <ChartCard
        className="mt-4"
        title="Price distribution where price exists"
        subtitle="10th to 90th percentile, with the median marked. Log scale."
      >
        <PlotFigure
          ariaLabel="Range chart of price deciles by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 20,
              marginBottom: 42,
              style: plotStyle,
              x: { label: 'Price (USD, log) →', grid: true, type: 'log', tickFormat: (d: number) => `$${d}` },
              y: { label: null, domain: rows.map(c => c.label) },
              marks: [
                Plot.link(rows, {
                  x1: (d: (typeof rows)[number]) => d.deciles[0] ?? 1,
                  x2: (d: (typeof rows)[number]) => d.deciles[8] ?? 1,
                  y: 'label',
                  stroke: ACCENT.blue,
                  strokeWidth: 5,
                  strokeOpacity: 0.25,
                  strokeLinecap: 'round',
                }),
                Plot.dot(rows, {
                  x: (d: (typeof rows)[number]) => d.deciles[4] ?? 1,
                  y: 'label',
                  r: 4,
                  fill: ACCENT.blue,
                  tip: true,
                  title: (d: (typeof rows)[number]) =>
                    `${d.label}\nmedian $${d.deciles[4]}\np10 $${d.deciles[0]} · p90 $${d.deciles[8]}\n${pct(d.nullPct)} missing`,
                }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>
    </Section>
  );
}

// ── §2 Brands ──────────────────────────────────────────────────────────────

function BrandConcentration({ data }: { data: Catalogue }) {
  const b = data.brands;
  const top = b[0];
  const bottom = b[b.length - 1];

  return (
    <Section
      eyebrow="Concentration"
      title="Measured by reviews, most categories are unconcentrated"
      lede={
        <>
          HHI over brands, computed two ways: by share of items listed and by share of reviews
          received. {top.label} is the outlier at {int(top.hhiReviews)} on reviews — a single seller
          dominating what is effectively Amazon&rsquo;s own product. {bottom.label} sits at{' '}
          {int(bottom.hhiReviews)}. For scale, US antitrust guidelines call a market
          &ldquo;highly concentrated&rdquo; above 2,500, so all but one of these markets are
          formally competitive.
        </>
      }
    >
      <ChartCard
        title="Brand HHI by category, items versus reviews"
        subtitle="Log scale — the range spans three orders of magnitude. Higher means more concentrated."
      >
        <PlotFigure
          ariaLabel="Scatterplot of brand HHI by items against reviews."
          options={width =>
            ({
              width,
              height: Math.min(460, Math.max(340, width * 0.55)),
              marginLeft: 62,
              marginBottom: 48,
              marginRight: 18,
              style: plotStyle,
              x: { label: 'HHI by share of items listed →', grid: true, type: 'log' },
              y: { label: '↑ HHI by share of reviews', grid: true, type: 'log' },
              r: { range: [3, 18] },
              marks: [
                Plot.link(
                  [{ a: 1, b: 6000 }],
                  { x1: 'a', y1: 'a', x2: 'b', y2: 'b', stroke: MUTED, strokeDasharray: '4,4' }
                ),
                Plot.dot(b, {
                  x: 'hhiItems',
                  y: 'hhiReviews',
                  r: 'reviews',
                  fill: ACCENT.plum,
                  fillOpacity: 0.55,
                  stroke: ACCENT.plum,
                  tip: true,
                  title: (d: (typeof b)[number]) =>
                    `${d.label}\nHHI items ${d.hhiItems} · HHI reviews ${d.hhiReviews}\nCR4 items ${pct(d.cr4Items)} · CR4 reviews ${pct(d.cr4Reviews)}\n${int(d.brands)} brands · ${int(d.items)} items`,
                }),
                Plot.text(b.filter(x => x.hhiReviews > 200 || x.reviews > 4e7), {
                  x: 'hhiItems',
                  y: 'hhiReviews',
                  text: 'label',
                  dy: -12,
                  fontSize: 10,
                  fill: MUTED,
                }),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] leading-snug text-hub-ink-faint">
          Everything sits above the diagonal, meaning attention is more concentrated than the
          catalogue is: the brands with the most listings are not merely proportionally reviewed, they
          absorb more than their share. That gap is the interesting quantity, not either HHI alone.
        </p>
      </ChartCard>
    </Section>
  );
}

// ── §3 Attribute vocabulary ────────────────────────────────────────────────

function TheAttributeVocabulary({ data }: { data: Catalogue }) {
  const keys = data.topKeys;
  const withDepth = data.tree.filter(t => t.emptyPct < 100);

  return (
    <Section
      eyebrow="Structure"
      title="Two thousand ways to describe a product"
      lede={
        <>
          The <code className="font-plex text-[13px]">details</code> field is a free-form dictionary,
          and across {data.detailsCategories} categories it contains a vocabulary of over two thousand
          distinct keys. The top thirty carry most of the coverage; the tail is where any attempt at
          structured product comparison goes to die.
        </>
      }
    >
      <ChartCard
        title="Most common product-detail keys"
        subtitle="Items carrying each key, summed across categories."
      >
        <PlotFigure
          ariaLabel="Bar chart of the most common product detail keys."
          options={width =>
            ({
              width,
              height: 560,
              marginLeft: width < 560 ? 128 : 168,
              marginRight: 58,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Items carrying this key →', grid: true, tickFormat: (d: number) => compact(d) },
              y: { label: null, domain: keys.map(k => k.key) },
              marks: [
                Plot.barX(keys, {
                  x: 'items',
                  y: 'key',
                  fill: ACCENT.teal,
                  fillOpacity: 0.8,
                  tip: true,
                  title: (d: (typeof keys)[number]) =>
                    `${d.key}\n${int(d.items)} items\npresent in ${d.cats} categories`,
                }),
                Plot.text(keys, {
                  x: 'items',
                  y: 'key',
                  text: (d: (typeof keys)[number]) => compact(d.items),
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

      <ChartCard
        className="mt-4"
        title="Category-tree depth"
        subtitle={`Mean breadcrumb depth, for the ${withDepth.length} of 33 categories that populate the field at all.`}
      >
        <PlotFigure
          ariaLabel="Bar chart of category tree depth."
          options={width =>
            ({
              width,
              height: 520,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 54,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Mean breadcrumb depth →', grid: true },
              y: { label: null, domain: withDepth.map(t => t.label) },
              marks: [
                Plot.barX(withDepth, {
                  x: 'avgDepth',
                  y: 'label',
                  fill: ACCENT.blue,
                  fillOpacity: 0.8,
                  tip: true,
                  title: (d: (typeof withDepth)[number]) =>
                    `${d.label}\nmean depth ${d.avgDepth} · max ${d.maxDepth}\n${int(d.paths)} distinct paths\n${pct(d.emptyPct)} of items have no breadcrumb`,
                }),
                Plot.text(withDepth, {
                  x: 'avgDepth',
                  y: 'label',
                  text: (d: (typeof withDepth)[number]) => d.avgDepth.toFixed(1),
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
        <p className="mt-2 text-[12px] leading-snug text-hub-ink-faint">
          {33 - withDepth.length} categories report 100% empty breadcrumbs and are omitted rather than
          drawn as zero — an absent field and a depth of zero are different facts.
        </p>
      </ChartCard>
    </Section>
  );
}

// ── §4 The negative results ────────────────────────────────────────────────

function WhatTheCorpusCannotSay({ data }: { data: Catalogue }) {
  return (
    <Section
      eyebrow="Negative results"
      title="Three things this dataset cannot tell you"
      lede="Publishing only the measures that worked would misrepresent the corpus. These three were specified, attempted, and abandoned — each for a different and instructive reason."
    >
      <ol className="space-y-4">
        <li className="rounded-xl border border-hub-line bg-hub-card p-5 shadow-hub">
          <h3 className="font-serif text-[16px] font-semibold text-hub-ink">
            The co-purchase graph does not exist
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-hub-ink-soft">
            <code className="font-plex text-[12.5px]">bought_together</code> is null for every item in{' '}
            <strong>all {data.boughtTogether.categories} categories</strong> — {data.boughtTogether.withAny}{' '}
            have any coverage at all. The field is documented in the dataset schema, which makes it
            look available; it is empty in practice. This was the one interaction signal that needed no
            reviewer-level shuffle, and it is simply not there.
          </p>
        </li>

        <li className="rounded-xl border border-hub-line bg-hub-card p-5 shadow-hub">
          <h3 className="font-serif text-[16px] font-semibold text-hub-ink">
            &ldquo;Items that never got reviewed&rdquo; is unanswerable
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-hub-ink-soft">
            Exactly zero of the 35,003,183 items have a rating count of zero. That is not a fact about
            Amazon — the metadata split only contains items that appear in the reviews split, so the
            denominator the measure needs, every listed product whether reviewed or not, is absent by
            construction. Publishing &ldquo;0%&rdquo; would have stated an artifact as a finding.
          </p>
        </li>

        <li className="rounded-xl border border-hub-line bg-hub-card p-5 shadow-hub">
          <h3 className="font-serif text-[16px] font-semibold text-hub-ink">
            Page rating versus computed rating — deferred, not abandoned
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-hub-ink-soft">
            Comparing the rating Amazon displays against the mean of the reviews actually present
            would measure how much of a star rating comes from ratings-without-reviews. It needed a
            second full pass over the 245 GB review corpus during the metadata scan, roughly doubling
            that tier&rsquo;s cost for one number. The by-item extract now exists, so it is cheap the
            next time round.
          </p>
        </li>
      </ol>

      <Warning label="Why this section exists.">
        A dataset page that lists only its successes teaches the wrong lesson about data work. Two of
        these three are properties of how the corpus was assembled rather than of Amazon, and telling
        them apart is most of the skill.
      </Warning>
    </Section>
  );
}
