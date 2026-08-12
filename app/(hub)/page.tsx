import type { Metadata } from 'next';
import { GalleryExplorer } from '@/components/hub/GalleryExplorer';
import { getRegistry, getRegistryIncludingUnlisted, getTopicOrder } from '@/lib/registry-db';
import { getRegistryFacets } from '@/lib/registry';
import { SITE_URL } from '@/lib/share-metadata';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Vishal Singh, NYU Stern',
  description:
    'Explore data apps, interactive articles, and dashboards for public health, politics, business, and more.',
  alternates: { canonical: `${SITE_URL}/` },
  // Override the root layout's `siteName: 'D3M'` (the book's brand) — on the
  // main site, link previews should read as a personal site, with the actual
  // favicon carrying the identity mark instead of a text badge.
  openGraph: { siteName: 'vishalsingh.org' },
};

const homeLd = [
  { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Vishal Singh', url: `${SITE_URL}/` },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Vishal Singh',
    jobTitle: 'Professor of Marketing',
    affiliation: { '@type': 'CollegeOrUniversity', name: 'New York University, Stern School of Business' },
    url: `${SITE_URL}/`,
    sameAs: ['http://www.linkedin.com/in/visualsingh'],
  },
];

// ISR: re-read the Tigris article manifest periodically so new data stories
// appear in the gallery without a redeploy (pair with /api/revalidate for instant).
export const revalidate = 600;

export default async function HomeGallery() {
  const items = await getRegistry();
  const facets = getRegistryFacets(items);
  // Shelf order, curated in /admin. A prefix, not the full section list — the
  // gallery appends anything it doesn't mention (see galleryTopicOrder).
  const topicOrder = await getTopicOrder();

  // Collection sizes count unlisted members too. A series normally keeps its
  // parts unlisted so they don't litter the grid, so counting only what the
  // gallery can see would leave a six-part series looking like a single item.
  const withUnlisted = await getRegistryIncludingUnlisted();
  const collectionSizes: Record<string, number> = {};
  for (const i of withUnlisted) {
    if (i.collection) collectionSizes[i.collection] = (collectionSizes[i.collection] ?? 0) + 1;
  }

  return (
    <div>
      <JsonLd data={homeLd} />
      <header className="hub-hero border-b border-hub-line">
        <div className="mx-auto max-w-6xl px-5 py-11 sm:px-7 sm:py-14">
          <div className="font-plex text-[12px] uppercase tracking-[0.16em] text-hub-amber">
            Vishal Singh · NYU Stern
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-[clamp(34px,5.8vw,56px)] font-semibold leading-[1.05] tracking-tight text-hub-ink">
            Explore Interactive apps, data-stories, and case studies.
          </h1>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-hub-ink-soft">
            Teaching studios, apps, and data stories spanning public health, politics,
            business, and other public data. Filter by type or topic below — each piece opens in a new tab.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-7">
        <GalleryExplorer
          items={items}
          facets={facets}
          collectionSizes={collectionSizes}
          topicOrder={topicOrder}
        />
      </div>
    </div>
  );
}
