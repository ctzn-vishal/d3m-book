import type { Metadata } from 'next';
import { GalleryExplorer } from '@/components/hub/GalleryExplorer';
import { getRegistry } from '@/lib/registry-db';
import { getRegistryFacets } from '@/lib/registry';
import { SITE_URL } from '@/lib/share-metadata';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Vishal Singh — Interactive Data Gallery',
  description:
    'A gallery of interactive dashboards, data stories, and apps built from real datasets across public health, politics, pricing, and markets — by Vishal Singh, NYU Stern.',
  alternates: { canonical: `${SITE_URL}/` },
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

  return (
    <div>
      <JsonLd data={homeLd} />
      <header className="hub-hero border-b border-hub-line">
        <div className="mx-auto max-w-6xl px-5 py-11 sm:px-7 sm:py-14">
          <div className="font-plex text-[12px] uppercase tracking-[0.16em] text-hub-amber">
            Vishal Singh · NYU Stern
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-[clamp(34px,5.8vw,56px)] font-semibold leading-[1.05] tracking-tight text-hub-ink">
            Explore Interactive apps, data-stories, and case studies..
          </h1>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-hub-ink-soft">
            Teaching studios, data stories, apps, and datasets spanning public health, politics,
            business, and other public data. Filter by type or topic below — each piece opens in a new tab.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-7">
        <GalleryExplorer items={items} facets={facets} />
      </div>
    </div>
  );
}
