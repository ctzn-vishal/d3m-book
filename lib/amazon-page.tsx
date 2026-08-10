import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { JsonLd } from '@/components/JsonLd';
import { ArticleHeader } from '@/components/amazon/ArticleHeader';
import { NextAnalysis } from '@/components/amazon/NextAnalysis';
import { findAnalysis } from '@/lib/amazon';
import { SITE_URL, createPreviewMetadata } from '@/lib/share-metadata';

/**
 * One call replaces the ~50 lines of metadata + JSON-LD + shell wiring that
 * every /amazon/<slug> page would otherwise repeat, mirroring what
 * lib/chapter-page.tsx does for book articles.
 *
 * Throws at module-load time — i.e. at `next build` — if the slug is missing
 * from lib/amazon.ts, so a typo fails the build rather than shipping a page
 * with no title and no index entry.
 */
export function amazonAnalysisPage<T>({
  slug,
  Report,
  data,
  standfirst,
  description,
}: {
  slug: string;
  Report: ComponentType<{ data: T }>;
  data: T;
  /** The dek under the H1 — one or two sentences stating the finding. */
  standfirst: string;
  /** Meta description; keep it ~120–170 chars. */
  description: string;
}) {
  const analysis = findAnalysis(slug);
  if (!analysis) {
    throw new Error(`amazonAnalysisPage("${slug}"): no entry in lib/amazon.ts#ANALYSES.`);
  }

  const title = `${analysis.title} — Amazon reviews`;

  const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/amazon/${slug}` },
    ...createPreviewMetadata({ title, description, type: 'article' }),
  };

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: analysis.title,
    description,
    url: `${SITE_URL}/amazon/${slug}`,
    author: { '@type': 'Person', name: 'Vishal Singh' },
    dateModified: analysis.updated,
    isPartOf: {
      '@type': 'Dataset',
      name: 'Amazon Reviews 2023 — Aggregate Statistics',
      url: `${SITE_URL}/amazon`,
    },
  };

  function Page() {
    return (
      <>
        <JsonLd data={articleLd} />
        <ArticleHeader analysis={analysis!} standfirst={standfirst} />
        <main className="mx-auto max-w-6xl px-5 pb-16 sm:px-7">
          <Report data={data} />
        </main>
        <NextAnalysis current={slug} />
      </>
    );
  }

  return { metadata, Page };
}
