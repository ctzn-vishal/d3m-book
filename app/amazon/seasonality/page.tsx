import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { ArticleHeader } from '@/components/amazon/ArticleHeader';
import { SeasonalityReport } from '@/components/amazon/SeasonalityReport';
import { NextAnalysis } from '@/components/amazon/NextAnalysis';
import type { AmazonData } from '@/components/amazon/types';
import { findAnalysis } from '@/lib/amazon';
import { SITE_URL, createPreviewMetadata } from '@/lib/share-metadata';
import raw from '../data/amazon-reviews.json';

const data = raw as AmazonData;
const analysis = findAnalysis('seasonality')!;

const standfirst =
  'January is the biggest review month of the year, and also the kindest. Across all 33 categories, the size of a category’s January spike predicts how much better it rates in January than December — which points at something specific about who is holding the product.';

const title = `${analysis.title} — Amazon reviews`;
const description =
  'Month, weekday, and hour-of-day patterns across 507.7M Amazon reviews and 33 product categories, including the gift-season rating gap between December and January.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/amazon/seasonality` },
  ...createPreviewMetadata({ title, description, type: 'article' }),
};

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: analysis.title,
  description,
  url: `${SITE_URL}/amazon/seasonality`,
  author: { '@type': 'Person', name: 'Vishal Singh' },
  dateModified: analysis.updated,
  isPartOf: { '@type': 'Dataset', name: 'Amazon Reviews 2023 — Aggregate Statistics', url: `${SITE_URL}/amazon` },
};

export default function SeasonalityPage() {
  return (
    <>
      <JsonLd data={articleLd} />
      <ArticleHeader analysis={analysis} standfirst={standfirst} />
      <main className="mx-auto max-w-6xl px-5 pb-16 sm:px-7">
        <SeasonalityReport data={data} />
      </main>
      <NextAnalysis current="seasonality" />
    </>
  );
}
