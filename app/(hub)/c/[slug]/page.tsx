import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getRegistryIncludingUnlisted } from '@/lib/registry-db';
import { GENERATED_COLLECTIONS, findCollection, isOrdered, sortMembers } from '@/lib/collections';
import { GalleryCard } from '@/components/hub/GalleryCard';
import { SITE_URL } from '@/lib/share-metadata';
import { JsonLd } from '@/components/JsonLd';

/**
 * Generated collection hub — /c/<slug>.
 *
 * Everything here comes from rows claiming the slug, so a collection gains a
 * page the moment two items are filed into it and grows without this file (or
 * any member) being edited. Collections that outgrew the generic treatment
 * declare an `href` in lib/collections.ts and are excluded from this route.
 *
 * Unlisted members are included deliberately: 'unlisted' means "served, but no
 * card in the gallery grid", which is exactly what a series part should be —
 * it belongs on its collection's page, not loose in the catalog.
 */

export const revalidate = 600;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GENERATED_COLLECTIONS.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = findCollection(slug);
  if (!collection) return { title: 'Collection not found' };
  return {
    title: `${collection.title} — Vishal Singh`,
    description: collection.blurb,
    alternates: { canonical: `${SITE_URL}/c/${slug}` },
    openGraph: { siteName: 'vishalsingh.org' },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = findCollection(slug);
  if (!collection || collection.href) notFound();

  const all = await getRegistryIncludingUnlisted();
  const members = sortMembers(all.filter(i => i.collection === slug));
  if (members.length === 0) notFound();

  const ordered = isOrdered(members);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    name: collection.title,
    description: collection.blurb,
    url: `${SITE_URL}/c/${slug}`,
    author: { '@type': 'Person', name: 'Vishal Singh' },
    hasPart: members.map(m => ({ '@type': 'CreativeWork', name: m.title, url: m.href })),
  };

  return (
    <>
      <JsonLd data={ld} />

      <header className="border-b border-hub-line bg-hub-paper2/60">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-7 sm:py-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-plex text-[10.5px] uppercase tracking-[0.16em] text-hub-ink-faint transition-colors hover:text-hub-teal"
          >
            <ArrowLeft size={12} strokeWidth={2} /> Gallery
          </Link>

          <p className="mt-4 font-plex text-[10.5px] uppercase tracking-[0.18em] text-hub-teal">
            {ordered ? 'Series' : 'Collection'}
            {collection.source ? ` · ${collection.source}` : ''}
          </p>
          <h1 className="mt-2 max-w-3xl font-serif text-[clamp(27px,4.4vw,42px)] font-semibold leading-[1.08] tracking-tight text-hub-ink">
            {collection.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-hub-ink-soft">{collection.blurb}</p>

          <p className="mt-5 font-plex text-[11px] uppercase tracking-[0.06em] text-hub-ink-faint">
            {/* "so far" while building — never quote a denominator for parts
                that haven't been written yet. */}
            {members.length} {members.length === 1 ? 'part' : 'parts'}
            {collection.status === 'building' ? ' so far' : ''}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-7">
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((item, i) => (
            <li key={`${item.type}-${item.id}`} className="relative">
              {ordered && (
                <span className="absolute -top-2 left-3 z-10 rounded-full bg-hub-ink px-2 py-0.5 font-plex text-[10px] uppercase tracking-wider text-hub-paper">
                  Part {item.part ?? i + 1}
                </span>
              )}
              <GalleryCard item={item} />
            </li>
          ))}
        </ol>

        {collection.status === 'building' && (
          <p className="mt-8 rounded-lg border border-dashed border-hub-line-strong bg-hub-paper2/50 px-4 py-3 text-[13.5px] leading-relaxed text-hub-ink-soft">
            This collection is still growing — more parts are on the way.
          </p>
        )}
      </main>
    </>
  );
}
