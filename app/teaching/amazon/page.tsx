import type { Metadata } from 'next';
import { ArrowDown, Database, ExternalLink } from 'lucide-react';
import { BookFrame } from '@/components/Book/BookFrame';
import { JsonLd } from '@/components/JsonLd';
import { AmazonReport } from '@/components/Book/amazon/AmazonReport';
import { compact, int, isoDate, pct, type AmazonData } from '@/components/Book/amazon/types';
import { book } from '@/lib/book-toc';
import { SITE_URL, createPreviewMetadata } from '@/lib/share-metadata';
import raw from './data/amazon-reviews.json';

const data = raw as AmazonData;
const { meta } = data;

const title = `Half a billion Amazon reviews — ${book.title}`;
const description = `A visual read of pre-computed aggregates over ${int(meta.totalReviews)} Amazon reviews across ${meta.categoryCount} product categories, 1996–2023: rating distributions, category volumes, growth, seasonality, and the verified-purchase gap.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/teaching/amazon` },
  ...createPreviewMetadata({ title, description, imageAlt: 'Amazon Reviews 2023 aggregate statistics' }),
};

const datasetLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Amazon Reviews 2023 — Aggregate Statistics',
  description: `Pre-computed aggregates over ${int(meta.totalReviews)} Amazon reviews across ${meta.categoryCount} product categories, 1996–2023. Counts, means, and distributions only — no review text, user IDs, or product IDs.`,
  url: `${SITE_URL}/teaching/amazon`,
  creator: { '@type': 'Person', name: 'Vishal Singh' },
  isBasedOn: meta.source,
  temporalCoverage: `${meta.from}/${meta.to}`,
  variableMeasured: ['review count', 'mean star rating', 'star-rating distribution', 'verified-purchase share', 'mean review length'],
  distribution: [
    { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${meta.bucket}category_stats_all.csv` },
    { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${meta.bucket}ts_yearly_all.csv` },
  ],
};

/** Headline figures for the hero strip. */
const stats = [
  { value: compact(meta.totalReviews), label: 'reviews' },
  { value: String(meta.categoryCount), label: 'categories' },
  { value: String(data.series.yearly.ALL.length), label: 'years covered' },
  { value: `${meta.avgRating.toFixed(2)}★`, label: 'mean rating' },
  { value: pct(meta.dist[4], 0), label: 'five-star' },
  { value: pct(meta.verifiedPct, 0), label: 'verified' },
];

/**
 * Backdrop sparkline for the hero: reviews per year, 1996–2023, as a filled
 * area. Server-rendered from the same JSON the charts use, so it can never
 * drift from the numbers underneath it.
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
      className="absolute inset-x-0 bottom-0 h-[62%] w-full"
    >
      <defs>
        <linearGradient id="hero-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${line} L 1000,200 L 0,200 Z`} fill="url(#hero-spark)" />
      <path d={`M ${line}`} fill="none" stroke="#7DD3FC" strokeOpacity="0.6" strokeWidth="1.5" />
    </svg>
  );
}

export default function AmazonReviewsPage() {
  const hero = (
    <section className="relative overflow-hidden border-b border-border bg-slate-950">
      <HeroSpark />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />

      <div className="relative mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-sky-300/80">
          Dataset portrait · Teaching
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-[clamp(30px,5vw,50px)] font-semibold leading-[1.07] tracking-tight text-white">
          Half a billion Amazon reviews
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-slate-300">
          {int(meta.totalReviews)} reviews across {meta.categoryCount} product categories, from{' '}
          {isoDate(meta.from)} to {isoDate(meta.to)}, reduced to counts, means, and distributions.
          No review text, no user IDs, no product IDs — which makes this a corpus you can hand to a
          class on day one and still learn something real from.
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
          {stats.map(s => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="mt-1.5 font-mono text-[10.5px] uppercase tracking-wider text-slate-400">
                {s.label}
              </dt>
              <dd className="font-display text-[26px] font-semibold leading-none tracking-tight text-white tabular-nums">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#explore"
            className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-950/40 transition-colors hover:bg-sky-600"
          >
            <ArrowDown size={15} strokeWidth={2.2} /> Explore by category
          </a>
          <a
            href={meta.source}
            className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <Database size={14} strokeWidth={2} /> Source dataset
            <ExternalLink size={13} className="opacity-70" />
          </a>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <JsonLd data={datasetLd} />
      <BookFrame book={book} beforeContent={hero}>
        <AmazonReport data={data} />
      </BookFrame>
    </>
  );
}
