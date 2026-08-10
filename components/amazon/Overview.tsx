'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChartCard, Legend, Aside, Section } from './ui';
import { plotStyle } from './ui';
import {
  ACCENT,
  ALL,
  MUTED,
  STARS,
  SURFACE,
  compact,
  int,
  isoDate,
  pct,
  type AmazonData,
  type CategoryStat,
} from './types';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

/**
 * The /amazon overview: what the corpus is, before any particular question is
 * asked of it. Three sections — the rating distribution, the category
 * leaderboard, and the verification gap — chosen because each one changes how
 * you should read every analysis linked from the index below it.
 */
export function Overview({ data, quality }: { data: AmazonData; quality?: ReviewQuality }) {
  return (
    <>
      <TheShapeOfRatings data={data} />
      <TheCategories data={data} />
      <TheVerificationGap data={data} quality={quality} />
    </>
  );
}

/** The slice of phase2-review-quality.json this section needs. */
export interface ReviewQuality {
  verProfile: Array<{ verified: boolean; n: number; mean: number; dist: number[] }>;
  verByCategory: Array<{ key: string; label: string; v: number; u: number; gap: number; n: number }>;
}

// ── Rating distribution ────────────────────────────────────────────────────

function TheShapeOfRatings({ data }: { data: AmazonData }) {
  const { meta } = data;
  const extremes = meta.dist[0] + meta.dist[4];
  // Complement rather than a second sum: the five shares are each rounded
  // upstream, so adding three and adding two independently reads as 100.1%.
  const middle = 100 - extremes;

  return (
    <Section
      eyebrow="The distribution"
      title={`A mean of ${meta.avgRating.toFixed(2)} describes almost nothing`}
      lede={
        <>
          Star ratings are not bell-shaped. Across all {compact(meta.totalReviews)} reviews,{' '}
          {pct(extremes)} of the mass sits at the two ends of the scale and only {pct(middle)} sits
          in the middle three. The distribution is J-shaped: 5★ is the mode, 1★ is the runner-up,
          and the arithmetic mean lands where almost nobody actually rates.
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
              <span className="w-9 shrink-0 text-right font-plex text-[12px] tabular-nums text-hub-ink-faint">
                {i + 1}★
              </span>
              <span className="relative h-7 flex-1 overflow-hidden rounded-sm bg-hub-paper2">
                <span
                  className="absolute inset-y-0 left-0 rounded-sm"
                  style={{ width: `${meta.dist[i]}%`, backgroundColor: STARS[i] }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-plex text-[12.5px] font-medium tabular-nums text-hub-ink">
                {meta.dist[i].toFixed(1)}%
              </span>
              <span className="hidden w-20 shrink-0 text-right font-plex text-[11.5px] tabular-nums text-hub-ink-faint sm:block">
                {compact(Math.round((meta.dist[i] / 100) * meta.totalReviews))}
              </span>
            </li>
          ))}
        </ol>
      </ChartCard>

      <Aside>
        This is the single most consequential fact about review data. Any model, dashboard, or
        pricing rule treating &ldquo;average rating&rdquo; as a location parameter is summarising a
        bimodal distribution with a number that describes neither mode. The useful summaries are
        share-at-5★, share-at-1★, and the ratio between them.
      </Aside>
    </Section>
  );
}

// ── Category leaderboard ───────────────────────────────────────────────────

type SortKey = 'n' | 'r' | 'five' | 'v' | 'l';

const SORTS: Array<{
  key: SortKey;
  short: string;
  fmt: (c: CategoryStat) => string;
  val: (c: CategoryStat) => number;
}> = [
  { key: 'n', short: 'Reviews', fmt: c => compact(c.n), val: c => c.n },
  { key: 'r', short: 'Mean ★', fmt: c => c.r.toFixed(2), val: c => c.r },
  { key: 'five', short: '5★ %', fmt: c => pct(c.d[4]), val: c => c.d[4] },
  { key: 'v', short: 'Verified %', fmt: c => pct(c.v), val: c => c.v },
  { key: 'l', short: 'Chars', fmt: c => `${Math.round(c.l)}`, val: c => c.l },
];

function TheCategories({ data }: { data: AmazonData }) {
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
        title={`All ${data.meta.categoryCount} categories`}
        subtitle="Sort by any column."
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
                    ? 'bg-hub-teal text-hub-paper'
                    : 'bg-hub-paper2 text-hub-ink-faint hover:text-hub-ink'
                }`}
              >
                {s.short}
              </button>
            ))}
          </div>
        }
      >
        <ol className="divide-y divide-hub-line">
          {rows.map((c, i) => {
            // Bars scale to the visible spread of the active metric, not to
            // zero — mean ratings all sit between 3.8 and 4.6, and a zero-based
            // bar would show 33 identical stripes.
            const span = max - min || 1;
            const width = sort === 'n' ? (c.n / max) * 100 : 12 + ((active.val(c) - min) / span) * 88;
            return (
              <li key={c.key} className="flex items-center gap-3 py-2">
                <span className="w-5 shrink-0 font-plex text-[11px] tabular-nums text-hub-ink-faint">
                  {i + 1}
                </span>
                <span className="w-[8.5rem] shrink-0 truncate text-[13.5px] leading-snug text-hub-ink sm:w-52">
                  {c.label}
                </span>
                <span className="relative hidden h-2.5 flex-1 overflow-hidden rounded-full bg-hub-paper2 sm:block">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${width}%`, backgroundColor: ACCENT.blue, opacity: 0.85 }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right font-plex text-[12.5px] font-medium tabular-nums text-hub-ink">
                  {active.fmt(c)}
                </span>
                <span className="hidden w-40 shrink-0 justify-end gap-3 font-plex text-[11.5px] tabular-nums text-hub-ink-faint lg:flex">
                  {sort !== 'n' && <span title="reviews">{compact(c.n)}</span>}
                  {sort !== 'r' && <span title="mean rating">{c.r.toFixed(2)}★</span>}
                  {sort !== 'v' && <span title="verified share">{Math.round(c.v)}% v</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </ChartCard>
    </Section>
  );
}

// ── Verification gap ───────────────────────────────────────────────────────

/** Categories whose reviews decouple from a purchase on Amazon. */
export const MEDIA = new Set([
  'Books',
  'Kindle_Store',
  'CDs_and_Vinyl',
  'Digital_Music',
  'Movies_and_TV',
]);

/**
 * Points that get a printed label. Deliberately not "everything large" — the
 * high-verified, mid-rating corner holds a dozen general-merchandise categories
 * on top of each other, and labelling them all turns it into a smudge.
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

function weight(cats: CategoryStat[], pick: (c: CategoryStat) => number): number {
  const n = cats.reduce((s, c) => s + c.n, 0);
  return cats.reduce((s, c) => s + c.n * pick(c), 0) / n;
}

function TheVerificationGap({ data, quality }: { data: AmazonData; quality?: ReviewQuality }) {
  const cats = data.categories;
  const media = cats.filter(c => MEDIA.has(c.key));
  const rest = cats.filter(c => !MEDIA.has(c.key));

  const ver = quality?.verProfile.find(v => v.verified);
  const unver = quality?.verProfile.find(v => !v.verified);
  const higher = quality?.verByCategory.filter(c => c.gap > 0).length ?? 0;

  return (
    <Section
      eyebrow="Verification"
      title="The least-verified categories are the best-rated"
      lede={
        <>
          {pct(data.meta.verifiedPct)} of reviews carry a verified-purchase flag — but that share
          collapses in media. Books, Kindle, CDs &amp; Vinyl, Digital Music, and Movies &amp; TV
          average {pct(weight(media, c => c.v))} verified against {pct(weight(rest, c => c.v))}{' '}
          everywhere else, and they rate {weight(media, c => c.r).toFixed(2)}★ against{' '}
          {weight(rest, c => c.r).toFixed(2)}★. It is tempting to conclude that unverified reviewers
          are the generous ones. They are not — see below.
        </>
      }
    >
      <ChartCard
        title="Verified-purchase share against mean rating"
        subtitle="One dot per category, sized by review volume. Media categories in amber."
      >
        <PlotFigure
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
                tickFormat: (d: number) => `${d}%`,
              },
              y: { label: '↑ Mean star rating', grid: true, domain: [3.7, 4.65] },
              r: { range: [3.5, 26] },
              marks: [
                Plot.dot(cats, {
                  x: 'v',
                  y: 'r',
                  r: 'n',
                  fill: (d: CategoryStat) => (MEDIA.has(d.key) ? ACCENT.amber : ACCENT.blue),
                  fillOpacity: 0.55,
                  stroke: (d: CategoryStat) => (MEDIA.has(d.key) ? ACCENT.amber : ACCENT.blue),
                  strokeWidth: 1.2,
                  tip: true,
                  title: (d: CategoryStat) =>
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
            { label: 'Media (book, music, video)', color: ACCENT.amber },
            { label: 'Everything else', color: ACCENT.blue },
          ]}
        />
      </ChartCard>

      {ver && unver ? (
        <Aside>
          <p>
            <strong className="font-semibold text-hub-ink">
              At the review level the relationship reverses.
            </strong>{' '}
            Pooled across all {compact(ver.n + unver.n)} reviews, verified purchases average{' '}
            {ver.mean.toFixed(3)}★ and unverified ones {unver.mean.toFixed(3)}★ — verified reviewers
            are the marginally <em>kinder</em> group, and that holds in {higher} of{' '}
            {quality!.verByCategory.length} categories.
          </p>
          <p className="mt-2.5">
            So the chart above is Simpson&rsquo;s paradox, not a finding about reviewer generosity.
            Media categories are both less-verified and better-rated, for reasons that have nothing
            to do with each other: they attract enthusiast raters, and their reviews often predate
            or bypass an Amazon purchase. Comparing categories recovers the composition; comparing
            reviews recovers the behaviour, and the two point opposite ways.
          </p>
          <p className="mt-2.5">
            Phase 1 could not show this — it published the rating distribution and the verified share
            as two separate marginals, and a joint cannot be recovered from marginals. The{' '}
            <a
              href="/amazon/review-quality"
              className="font-medium text-hub-teal underline decoration-hub-teal/40 underline-offset-2"
            >
              review-anatomy analysis
            </a>{' '}
            has the full 5 × 2 table by year and category.
          </p>
        </Aside>
      ) : (
        <Aside>
          Treat the verified flag as a <em>sampling</em> variable, not a quality filter. Restricting
          to verified reviews does not just remove noise — it removes Books, Kindle, and CDs from
          your sample far more aggressively than it removes Automotive, and it shifts the rating
          distribution while it does so.
        </Aside>
      )}
    </Section>
  );
}

export { ALL };
