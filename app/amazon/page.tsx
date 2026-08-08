import type { Metadata } from 'next';
import { ArrowDown, Database, ExternalLink } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { Overview } from '@/components/amazon/Overview';
import { AnalysisIndex } from '@/components/amazon/AnalysisIndex';
import { DataAppendix } from '@/components/amazon/DataAppendix';
import { StatStrip } from '@/components/amazon/ui';
import { compact, int, isoDate, pct, type AmazonData } from '@/components/amazon/types';
import { SITE_URL, createPreviewMetadata } from '@/lib/share-metadata';
import { LIVE_ANALYSES } from '@/lib/amazon';
import raw from './data/amazon-reviews.json';

const data = raw as AmazonData;
const { meta } = data;

const title = 'Half a billion Amazon reviews — Vishal Singh';
const description = `A working analysis of ${int(meta.totalReviews)} Amazon reviews across ${meta.categoryCount} product categories, 1996–2023: rating distributions, category structure, seasonality, growth, and the verified-purchase gap.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/amazon` },
  ...createPreviewMetadata({ title, description, imageAlt: 'Amazon Reviews 2023 aggregate statistics' }),
};

const datasetLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Amazon Reviews 2023 — Aggregate Statistics',
  description: `Pre-computed aggregates over ${int(meta.totalReviews)} Amazon reviews across ${meta.categoryCount} product categories, 1996–2023. Counts, means, and distributions only — no review text, user IDs, or product IDs.`,
  url: `${SITE_URL}/amazon`,
  creator: { '@type': 'Person', name: 'Vishal Singh' },
  isBasedOn: meta.source,
  temporalCoverage: `${meta.from}/${meta.to}`,
  variableMeasured: [
    'review count',
    'mean star rating',
    'star-rating distribution',
    'verified-purchase share',
    'mean review length',
  ],
  distribution: [
    { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${meta.bucket}category_stats_all.csv` },
    { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${meta.bucket}ts_yearly_all.csv` },
  ],
  hasPart: LIVE_ANALYSES.map(a => ({
    '@type': 'CreativeWork',
    name: a.title,
    url: `${SITE_URL}/amazon/${a.slug}`,
  })),
};

const stats = [
  { value: compact(meta.totalReviews), label: 'reviews' },
  { value: String(meta.categoryCount), label: 'categories' },
  { value: String(data.series.yearly.ALL.length), label: 'years covered' },
  { value: `${meta.avgRating.toFixed(2)}★`, label: 'mean rating' },
  { value: pct(meta.dist[4], 0), label: 'five-star' },
  { value: pct(meta.verifiedPct, 0), label: 'verified' },
];

/**
 * Backdrop sparkline: reviews per year, drawn from the same JSON the charts
 * read, so it can never drift from the numbers underneath it.
 */
function HeroSpark() {
  const cells = data.series.yearly.ALL;
  const maxN = Math.max(...cells.map(c => c.n));
  const x0 = cells[0].t;
  const x1 = cells[cells.length - 1].t;
  const px = (t: number) => ((t - x0) / (x1 - x0)) * 1000;
  const py = (n: number) => 200 - (n / maxN) * 200;
  const line = cells.map(c => `${px(c.t).toFixed(1)},${py(c.n).toFixed(1)}`).join(' L ');

  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 h-[58%] w-full"
    >
      <defs>
        <linearGradient id="amz-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--hub-teal))" stopOpacity="0.22" />
          <stop offset="100%" stopColor="rgb(var(--hub-teal))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${line} L 1000,200 L 0,200 Z`} fill="url(#amz-spark)" />
      <path
        d={`M ${line}`}
        fill="none"
        stroke="rgb(var(--hub-teal))"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function AmazonPage() {
  return (
    <>
      <JsonLd data={datasetLd} />

      <header className="relative overflow-hidden border-b border-hub-line bg-hub-paper2/60">
        <HeroSpark />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-7 sm:py-18">
          <p className="font-plex text-[10.5px] uppercase tracking-[0.2em] text-hub-teal">
            Working dataset · {LIVE_ANALYSES.length} analyses
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-[clamp(30px,5vw,50px)] font-semibold leading-[1.06] tracking-tight text-hub-ink">
            Half a billion Amazon reviews
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-hub-ink-soft">
            {int(meta.totalReviews)} reviews across {meta.categoryCount} product categories, from{' '}
            {isoDate(meta.from)} to {isoDate(meta.to)}, reduced to counts, means, and distributions.
            No review text, no user IDs, no product IDs — which makes it a corpus you can hand to a
            class on day one and still learn something real from.
          </p>

          <div className="mt-8">
            <StatStrip stats={stats} />
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#analyses"
              className="inline-flex items-center gap-2 rounded-md bg-hub-teal px-4 py-2.5 text-sm font-semibold text-hub-paper transition-opacity hover:opacity-90"
            >
              <ArrowDown size={15} strokeWidth={2.2} /> Browse the analyses
            </a>
            <a
              href={meta.source}
              className="inline-flex items-center gap-2 rounded-md border border-hub-line-strong px-4 py-2.5 text-sm font-medium text-hub-ink transition-colors hover:bg-hub-paper2"
            >
              <Database size={14} strokeWidth={2} /> Source dataset
              <ExternalLink size={13} className="opacity-60" />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-7">
        <Overview data={data} />
        <AnalysisIndex />
        <DataAppendix data={data} />
      </main>
    </>
  );
}
