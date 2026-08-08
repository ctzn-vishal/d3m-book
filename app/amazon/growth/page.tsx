import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { ArticleHeader } from '@/components/amazon/ArticleHeader';
import { GrowthReport } from '@/components/amazon/GrowthReport';
import { NextAnalysis } from '@/components/amazon/NextAnalysis';
import type { AmazonData } from '@/components/amazon/types';
import { findAnalysis } from '@/lib/amazon';
import { SITE_URL, createPreviewMetadata } from '@/lib/share-metadata';
import raw from '../data/amazon-reviews.json';

const data = raw as AmazonData;
const analysis = findAnalysis('growth')!;

const standfirst =
  'The corpus runs from 1996 to 2023, but the first seventeen years hold 3.7% of the reviews. What looks like a long history is a short one with a long tail — and the two discontinuities inside it matter more than the trend.';

const title = `${analysis.title} — Amazon reviews`;
const description =
  'Review volume, mean rating, and verified-purchase share by year across 507.7M Amazon reviews, with a per-category explorer.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/amazon/growth` },
  ...createPreviewMetadata({ title, description, type: 'article' }),
};

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: analysis.title,
  description,
  url: `${SITE_URL}/amazon/growth`,
  author: { '@type': 'Person', name: 'Vishal Singh' },
  dateModified: analysis.updated,
  isPartOf: { '@type': 'Dataset', name: 'Amazon Reviews 2023 — Aggregate Statistics', url: `${SITE_URL}/amazon` },
};

export default function GrowthPage() {
  return (
    <>
      <JsonLd data={articleLd} />
      <ArticleHeader analysis={analysis} standfirst={standfirst} />
      <main className="mx-auto max-w-6xl px-5 pb-16 sm:px-7">
        <GrowthReport data={data} />
      </main>
      <NextAnalysis current="growth" />
    </>
  );
}
