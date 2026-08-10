'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChartCard, Aside, Section, Warning, Legend, plotStyle } from './ui';
import { ACCENT, GRID, MUTED, STARS, SURFACE, compact, int, pct, signed } from './types';
import type { ReviewQualityData } from './phase2-types';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/**
 * /amazon/review-quality — the anatomy of a review, and the joint distributions
 * that a per-category summary can only report as separate margins.
 *
 * The centrepiece is the verified-purchase joint, because it reverses the sign
 * of the correlation the overview page reports at category level.
 */
export function ReviewQualityReport({ data }: { data: ReviewQualityData }) {
  return (
    <>
      <TheVerifiedReversal data={data} />
      <WhoGetsVotedHelpful data={data} />
      <TheLengthCurve data={data} />
      <PhotosAndDuplicates data={data} />
    </>
  );
}

// ── §1 The Simpson's paradox ───────────────────────────────────────────────

function TheVerifiedReversal({ data }: { data: ReviewQualityData }) {
  const v = data.verProfile.find(p => p.verified)!;
  const u = data.verProfile.find(p => !p.verified)!;
  const higher = data.verByCategory.filter(c => c.gap > 0);
  const lower = data.verByCategory.filter(c => c.gap < 0);

  const stack = [
    ...v.dist.map((share, i) => ({ group: 'Verified', star: i + 1, share })),
    ...u.dist.map((share, i) => ({ group: 'Unverified', star: i + 1, share })),
  ];

  return (
    <Section
      eyebrow="The reversal"
      title="Verified reviewers are the kinder ones"
      lede={
        <>
          Compare categories and the least-verified ones look the most generous. Compare individual
          reviews and it flips: verified purchases average {v.mean.toFixed(3)}★ across{' '}
          {compact(v.n)} reviews, unverified ones {u.mean.toFixed(3)}★ across {compact(u.n)}. Verified
          rates higher in {higher.length} of {data.verByCategory.length} categories. This is
          Simpson&rsquo;s paradox, and the overview page&rsquo;s category-level chart is the trap.
        </>
      }
    >
      <ChartCard
        title="Rating distribution by verified-purchase flag"
        subtitle="Counting the pairs directly. Reporting each margin separately — the rating split and the verified split — cannot produce this table."
      >
        <PlotFigure
          ariaLabel="Stacked bar chart of rating distribution for verified and unverified reviews."
          options={width =>
            ({
              width,
              height: 230,
              marginLeft: 76,
              marginBottom: 42,
              style: plotStyle,
              x: { label: 'Share of reviews →', grid: true, tickFormat: (v2: number) => `${v2}%` },
              y: { label: null, domain: ['Verified', 'Unverified'] },
              color: { domain: [1, 2, 3, 4, 5], range: STARS },
              marks: [
                Plot.barX(stack, {
                  x: 'share',
                  y: 'group',
                  fill: 'star',
                  order: 'sum',
                  stroke: SURFACE,
                  strokeWidth: 0.5,
                  tip: true,
                  title: (d: { group: string; star: number; share: number }) =>
                    `${d.group} · ${d.star}★\n${pct(d.share)}`,
                }),
              ],
            }) as PlotOptions
          }
        />
        <Legend items={STARS.map((c, i) => ({ label: `${i + 1}★`, color: c }))} />
      </ChartCard>

      <ChartCard
        className="mt-4"
        title="Verified minus unverified mean rating, by category"
        subtitle="Positive means verified purchases rate higher in that category."
      >
        <PlotFigure
          ariaLabel="Dot plot of the verified-unverified rating gap by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 54,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Verified − unverified, in stars →', grid: true },
              y: { label: null, domain: data.verByCategory.map(c => c.label) },
              marks: [
                Plot.ruleX([0], { stroke: MUTED }),
                Plot.link(data.verByCategory, {
                  x1: 0,
                  x2: 'gap',
                  y: 'label',
                  stroke: (d: (typeof data.verByCategory)[number]) =>
                    d.gap >= 0 ? ACCENT.teal : ACCENT.amber,
                  strokeWidth: 1.5,
                  strokeOpacity: 0.5,
                }),
                Plot.dot(data.verByCategory, {
                  x: 'gap',
                  y: 'label',
                  r: 4,
                  fill: (d: (typeof data.verByCategory)[number]) =>
                    d.gap >= 0 ? ACCENT.teal : ACCENT.amber,
                  tip: true,
                  title: (d: (typeof data.verByCategory)[number]) =>
                    `${d.label}\nverified ${d.v.toFixed(3)}★ · unverified ${d.u.toFixed(3)}★\ngap ${signed(d.gap, 3)}\n${int(d.n)} reviews`,
                }),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] leading-snug text-hub-ink-faint">
          {lower.length} categories buck it — {lower.map(c => c.label).join(', ')} — and they are the
          media and beauty ones, where an unverified review is often a considered opinion rather than
          a complaint.
        </p>
      </ChartCard>

      <Warning label="Why the sign flips.">
        Media categories are simultaneously the least-verified <em>and</em> the best-rated, for
        unrelated reasons: books and music attract enthusiasts, and their reviews frequently predate
        or bypass an Amazon purchase. Aggregating to the category level lets that composition drive
        the correlation, while the within-category comparison recovers the actual behaviour. Both
        charts are correct; only one of them is about reviewers.
      </Warning>
    </Section>
  );
}

// ── §2 Helpfulness ─────────────────────────────────────────────────────────

function WhoGetsVotedHelpful({ data }: { data: ReviewQualityData }) {
  const one = data.helpfulByRating.find(h => h.rating === 1)!;
  const five = data.helpfulByRating.find(h => h.rating === 5)!;
  const byP99 = data.helpfulAll;

  return (
    <Section
      eyebrow="Helpfulness"
      title="Negative reviews get read"
      lede={
        <>
          Helpful votes are the only signal in this corpus of what <em>other</em> shoppers valued.
          They are brutally skewed — the median review of any rating gets zero — so the story is in
          the upper tail. At the 99th percentile a one-star review
          collects {one.p99.toFixed(1)} votes against {five.p99.toFixed(1)} for a five-star one.
          Complaints travel {(one.p99 / five.p99).toFixed(2)}× further.
        </>
      }
    >
      <ChartCard
        title="Helpful votes by star rating"
        subtitle="90th and 99th percentile vote counts. Medians are omitted because they are zero at every rating."
      >
        <PlotFigure
          ariaLabel="Grouped bar chart of helpful-vote percentiles by star rating."
          options={width =>
            ({
              width,
              height: 260,
              marginLeft: 54,
              marginBottom: 46,
              style: plotStyle,
              fx: { label: 'Star rating →', domain: [1, 2, 3, 4, 5], tickFormat: (d: number) => `${d}★` },
              x: { axis: null, domain: ['p90', 'p99'] },
              y: { label: '↑ Helpful votes', grid: true },
              color: { domain: ['p90', 'p99'], range: [ACCENT.blue, ACCENT.plum], legend: true },
              marks: [
                Plot.barY(
                  data.helpfulByRating.flatMap(h => [
                    { rating: h.rating, kind: 'p90', v: h.p90, zero: h.zeroPct, n: h.n },
                    { rating: h.rating, kind: 'p99', v: h.p99, zero: h.zeroPct, n: h.n },
                  ]),
                  {
                    fx: 'rating',
                    x: 'kind',
                    y: 'v',
                    fill: 'kind',
                    fillOpacity: 0.85,
                    tip: true,
                    title: (d: { rating: number; kind: string; v: number; zero: number; n: number }) =>
                      `${d.rating}★ · ${d.kind}\n${d.v.toFixed(1)} votes\n${pct(d.zero)} of these reviews got zero votes\n${int(d.n)} reviews`,
                  }
                ),
                Plot.ruleY([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <ChartCard
        className="mt-4"
        title="Helpful-vote tail by category"
        subtitle="99th percentile votes, with the share of reviews receiving none."
      >
        <PlotFigure
          ariaLabel="Bar chart of 99th-percentile helpful votes by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 58,
              marginBottom: 40,
              style: plotStyle,
              x: { label: '99th percentile helpful votes →', grid: true },
              y: { label: null, domain: byP99.map(c => c.label) },
              marks: [
                Plot.barX(byP99, {
                  x: 'p99',
                  y: 'label',
                  fill: ACCENT.plum,
                  fillOpacity: 0.75,
                  tip: true,
                  title: (d: (typeof byP99)[number]) =>
                    `${d.label}\np99 ${d.p99} votes · p999 ${d.p999} · max ${int(d.max)}\n${pct(d.zeroPct)} got zero votes\n${int(d.n)} reviews`,
                }),
                Plot.text(byP99, {
                  x: 'p99',
                  y: 'label',
                  text: (d: (typeof byP99)[number]) => `${d.p99}`,
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

// ── §3 Length ──────────────────────────────────────────────────────────────

function TheLengthCurve({ data }: { data: ReviewQualityData }) {
  const l = data.lengthByRating;
  const peak = l.reduce((a, b) => (b.words > a.words ? b : a));
  const five = l.find(x => x.rating === 5)!;
  const one = l.find(x => x.rating === 1)!;

  return (
    <Section
      eyebrow="Effort"
      title="The longest reviews are the ambivalent ones"
      lede={
        <>
          Length against rating is an inverted U, not a line. A {peak.rating}-star review runs{' '}
          {peak.words.toFixed(0)} words on average; five stars takes {five.words.toFixed(0)} and one
          star {one.words.toFixed(0)}. Unqualified praise is quick. Explaining a mixed verdict takes
          work — and so, to a lesser extent, does justifying outright condemnation.
        </>
      }
    >
      <ChartCard
        title="Review length and emphasis by rating"
        subtitle="Mean words, plus exclamation marks and ALL-CAPS words per review — the only text features carried through the extract."
      >
        <PlotFigure
          ariaLabel="Line chart of mean review length by star rating."
          options={width =>
            ({
              width,
              height: 250,
              marginLeft: 54,
              marginBottom: 44,
              marginRight: 14,
              style: plotStyle,
              x: { label: 'Star rating →', domain: [1, 2, 3, 4, 5], tickFormat: (d: number) => `${d}★` },
              y: { label: '↑ Mean words', grid: true, domain: [0, 60] },
              marks: [
                Plot.areaY(l, { x: 'rating', y: 'words', fill: ACCENT.blue, fillOpacity: 0.12, curve: 'monotone-x' }),
                Plot.line(l, { x: 'rating', y: 'words', stroke: ACCENT.blue, strokeWidth: 2.2, curve: 'monotone-x' }),
                Plot.dot(l, {
                  x: 'rating',
                  y: 'words',
                  r: 3.4,
                  fill: ACCENT.blue,
                  tip: true,
                  title: (d: (typeof l)[number]) =>
                    `${d.rating}★\n${d.words.toFixed(1)} words mean · ${d.p50.toFixed(0)} median\n${d.excl.toFixed(2)} exclamation marks\n${d.caps.toFixed(2)} ALL-CAPS words\n${int(d.n)} reviews`,
                }),
                Plot.text(l, {
                  x: 'rating',
                  y: 'words',
                  text: (d: (typeof l)[number]) => d.words.toFixed(0),
                  dy: -10,
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
        title="Exclamation marks and shouting by rating"
        subtitle="Per review. Emphasis is U-shaped where length is inverted-U — the extremes shout, the middle explains."
      >
        <PlotFigure
          ariaLabel="Grouped bar chart of exclamation marks and caps words by rating."
          options={width =>
            ({
              width,
              height: 240,
              marginLeft: 54,
              marginBottom: 46,
              style: plotStyle,
              fx: { label: 'Star rating →', domain: [1, 2, 3, 4, 5], tickFormat: (d: number) => `${d}★` },
              x: { axis: null, domain: ['exclamations', 'ALL-CAPS words'] },
              y: { label: '↑ Per review', grid: true },
              color: { domain: ['exclamations', 'ALL-CAPS words'], range: [ACCENT.amber, ACCENT.plum], legend: true },
              marks: [
                Plot.barY(
                  l.flatMap(x => [
                    { rating: x.rating, kind: 'exclamations', v: x.excl },
                    { rating: x.rating, kind: 'ALL-CAPS words', v: x.caps },
                  ]),
                  {
                    fx: 'rating',
                    x: 'kind',
                    y: 'v',
                    fill: 'kind',
                    fillOpacity: 0.85,
                    tip: true,
                    title: (d: { rating: number; kind: string; v: number }) =>
                      `${d.rating}★\n${d.v.toFixed(3)} ${d.kind} per review`,
                  }
                ),
                Plot.ruleY([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>
    </Section>
  );
}

// ── §4 Photos and duplicates ───────────────────────────────────────────────

function PhotosAndDuplicates({ data }: { data: ReviewQualityData }) {
  const withImg = data.imgProfile.find(p => p.hasImage)!;
  const without = data.imgProfile.find(p => !p.hasImage)!;
  const imgShare = (100 * withImg.n) / (withImg.n + without.n);
  const dupPeak = data.dupByYear.reduce((a, b) => (b.pct > a.pct ? b : a));
  const dupNow = data.dupByYear[data.dupByYear.length - 1];

  return (
    <Section
      eyebrow="Photos & duplicates"
      title="Reviews with photos rate lower"
      lede={
        <>
          Only {pct(imgShare, 2)} of reviews carry a photo, and they are not the happy ones:{' '}
          {withImg.mean.toFixed(3)}★ with an image against {without.mean.toFixed(3)}★ without. People
          reach for the camera to document a problem. Separately, exact-duplicate review text peaked
          at {pct(dupPeak.pct)} of reviews in {dupPeak.year} and sits at {pct(dupNow.pct)} by{' '}
          {dupNow.year}.
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Rating with and without a photo" subtitle="Pooled across all categories and years.">
          <PlotFigure
            ariaLabel="Stacked bar chart of rating distribution by whether the review has an image."
            options={width =>
              ({
                width,
                height: 220,
                marginLeft: 72,
                marginBottom: 42,
                style: plotStyle,
                x: { label: 'Share →', grid: true, tickFormat: (v: number) => `${v}%` },
                y: { label: null, domain: ['With photo', 'No photo'] },
                color: { domain: [1, 2, 3, 4, 5], range: STARS },
                marks: [
                  Plot.barX(
                    [
                      ...withImg.dist.map((share, i) => ({ group: 'With photo', star: i + 1, share })),
                      ...without.dist.map((share, i) => ({ group: 'No photo', star: i + 1, share })),
                    ],
                    {
                      x: 'share',
                      y: 'group',
                      fill: 'star',
                      order: 'sum',
                      stroke: SURFACE,
                      strokeWidth: 0.5,
                      tip: true,
                      title: (d: { group: string; star: number; share: number }) =>
                        `${d.group} · ${d.star}★\n${pct(d.share)}`,
                    }
                  ),
                ],
              }) as PlotOptions
            }
          />
        </ChartCard>

        <ChartCard
          title="Exact-duplicate review text by year"
          subtitle="Share of reviews whose text appears verbatim on another review."
        >
          <PlotFigure
            ariaLabel="Line chart of duplicate review text share by year."
            options={width =>
              ({
                width,
                height: 220,
                marginLeft: 48,
                marginBottom: 42,
                marginRight: 12,
                style: plotStyle,
                x: { label: null, tickFormat: 'd' },
                y: { label: '↑ Share', grid: true, tickFormat: (v: number) => `${v}%` },
                marks: [
                  Plot.areaY(data.dupByYear, {
                    x: 'year',
                    y: 'pct',
                    fill: ACCENT.amber,
                    fillOpacity: 0.15,
                    curve: 'monotone-x',
                  }),
                  Plot.line(data.dupByYear, { x: 'year', y: 'pct', stroke: ACCENT.amber, strokeWidth: 2, curve: 'monotone-x' }),
                  Plot.dot(data.dupByYear, {
                    x: 'year',
                    y: 'pct',
                    r: 2.4,
                    fill: ACCENT.amber,
                    tip: true,
                    title: (d: (typeof data.dupByYear)[number]) =>
                      `${d.year}\n${pct(d.pct)} of reviews in a duplicate cluster\n${int(d.n)} reviews`,
                  }),
                ],
              }) as PlotOptions
            }
          />
        </ChartCard>
      </div>

      <Warning label="The duplicate rate is both a floor and a ceiling.">
        It is a <em>lower</em> bound on coordinated review activity, because paraphrased and
        AI-rewritten duplicates are invisible to an exact-text hash. It is simultaneously an{' '}
        <em>upper</em> bound on misconduct, because legitimate duplicates are everywhere: the same
        reviewer posting one verdict across product variants, and boilerplate like
        &ldquo;Good.&rdquo; colliding by chance across millions of reviews. Treat the trend as more
        informative than the level.
      </Warning>

      <ChartCard
        className="mt-6"
        title="Photo share by category"
        subtitle="Share of reviews carrying at least one image."
      >
        <PlotFigure
          ariaLabel="Bar chart of photo share by category."
          options={width =>
            ({
              width,
              height: 620,
              marginLeft: width < 560 ? 132 : 172,
              marginRight: 54,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Share of reviews with a photo →', grid: true, tickFormat: (v: number) => `${v}%` },
              y: { label: null, domain: data.imgByCategory.map(c => c.label) },
              marks: [
                Plot.barX(data.imgByCategory, {
                  x: 'pct',
                  y: 'label',
                  fill: ACCENT.teal,
                  fillOpacity: 0.8,
                  tip: true,
                  title: (d: (typeof data.imgByCategory)[number]) =>
                    `${d.label}\n${pct(d.pct, 2)} carry a photo\n${int(d.n)} reviews`,
                }),
                Plot.text(data.imgByCategory, {
                  x: 'pct',
                  y: 'label',
                  text: (d: (typeof data.imgByCategory)[number]) => pct(d.pct, 1),
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
