'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { RegistryItem } from '@/lib/registry-types';
import { GalleryCard } from '@/components/hub/GalleryCard';
import { CollectionCard } from '@/components/hub/CollectionCard';
import { findCollection, type Collection } from '@/lib/collections';
import { galleryTopicOrder, topicSlug, TOPIC_META } from '@/lib/taxonomy';

/** Items shown per shelf before the "see all" link takes over. */
const PER_SECTION = 6;

/** Bucket for rows with no topic — always last, and never silently dropped. */
const UNFILED = 'More from the catalog';

/** A shelf entry is either a single item or a whole collection standing in for
 *  its members. Collapsing happens per shelf, so a collection appears once, on
 *  the shelf of whichever topic its members carry. */
type Entry =
  | { kind: 'item'; key: string; item: RegistryItem; featured: boolean }
  | {
      kind: 'collection';
      key: string;
      collection: Collection;
      members: RegistryItem[];
      /** Every member, including unlisted ones the gallery never shows. */
      total: number;
      featured: boolean;
    };

/**
 * Fold a shelf's items so that members of a known collection collapse into one
 * card. A collection whose slug has no entry in lib/collections.ts is left
 * expanded — better a few loose cards than a card pointing at a hub that has no
 * title or blurb.
 */
function collapse(items: RegistryItem[], sizes: Record<string, number>): Entry[] {
  const out: Entry[] = [];
  const grouped = new Map<string, RegistryItem[]>();

  for (const item of items) {
    const c = item.collection ? findCollection(item.collection) : undefined;
    if (!c) {
      out.push({ kind: 'item', key: `${item.type}-${item.id}`, item, featured: item.featured });
      continue;
    }
    const list = grouped.get(c.slug);
    if (list) list.push(item);
    else grouped.set(c.slug, [item]);
  }

  for (const [slug, members] of grouped) {
    const c = findCollection(slug)!;
    // Size counts every member including unlisted ones. A series usually keeps
    // its parts unlisted so they don't litter the grid — judging by the visible
    // members alone would leave a six-part series showing as a lone card.
    const total = Math.max(sizes[slug] ?? 0, members.length);
    if (total < 2) {
      const only = members[0];
      out.push({ kind: 'item', key: `${only.type}-${only.id}`, item: only, featured: only.featured });
      continue;
    }
    out.push({
      kind: 'collection',
      key: `collection-${slug}`,
      collection: c,
      members,
      total,
      featured: members.some(m => m.featured),
    });
  }

  return out;
}

/**
 * The default (unfiltered) gallery: one shelf per topic instead of a single
 * ~180-card grid running 35 viewports.
 *
 * Shelves rather than horizontal carousels on purpose. `topic` is singular, so
 * shelves *partition* the catalog — every item appears in exactly one, at
 * exactly one position. A carousel would push most of each topic off-screen
 * behind a gesture with no second chance to surface it; a shelf shows the first
 * six and sends the rest to the topic page, which is built for exactly that.
 *
 * Section order comes from `galleryTopicOrder`, which appends any topic present
 * on the data but absent from the vocabulary. That is what keeps a retired
 * topic's items visible until they're re-filed — under a sectioned layout an
 * unmatched row is invisible, not merely unsorted.
 */
export function GallerySections({
  items,
  collectionSizes = {},
}: {
  items: RegistryItem[];
  /** slug → total members (published + unlisted), from the server. */
  collectionSizes?: Record<string, number>;
}) {
  const byTopic = new Map<string, RegistryItem[]>();
  for (const item of items) {
    const key = item.topic || UNFILED;
    const list = byTopic.get(key);
    if (list) list.push(item);
    else byTopic.set(key, [item]);
  }

  const present = [...byTopic.keys()].filter(k => k !== UNFILED);
  const order = galleryTopicOrder(present).filter(t => byTopic.has(t));
  if (byTopic.has(UNFILED)) order.push(UNFILED);

  return (
    <div className="mt-2">
      {order.map(topic => {
        const all = byTopic.get(topic)!;
        // Collapse collections first, then take the top six ENTRIES — a
        // five-part series occupies one slot, not five, which is the point.
        const entries = collapse(all, collectionSizes).sort((a, b) => Number(b.featured) - Number(a.featured));
        const shown = entries.slice(0, PER_SECTION);
        // Count in ITEMS, not entries: six cards can already represent more than
        // six pieces once a collection is folded in, and the "see all" link
        // should appear whenever the topic page holds something the shelf doesn't.
        const itemsShown = shown.reduce((n, e) => n + (e.kind === 'collection' ? e.members.length : 1), 0);
        const rest = all.length - itemsShown;
        const slug = topic === UNFILED ? undefined : topicSlug(topic);
        const blurb =
          topic === UNFILED
            ? undefined
            : (TOPIC_META as Record<string, { blurb: string } | undefined>)[topic]?.blurb;

        return (
          <section key={topic} className="border-t border-hub-line py-9 first:border-0 first:pt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 className="font-serif text-[21px] font-semibold leading-tight tracking-tight text-hub-ink">
                {slug ? (
                  <Link href={`/topic/${slug}`} className="transition-colors hover:text-hub-teal">
                    {topic}
                  </Link>
                ) : (
                  topic
                )}
              </h2>
              <span className="font-plex text-[11px] uppercase tracking-[0.06em] text-hub-ink-faint">
                {all.length} {all.length === 1 ? 'piece' : 'pieces'}
              </span>
            </div>

            {blurb && <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-hub-ink-soft">{blurb}</p>}

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map(entry =>
                entry.kind === 'collection' ? (
                  <CollectionCard
                    key={entry.key}
                    collection={entry.collection}
                    members={entry.members}
                    total={entry.total}
                  />
                ) : (
                  <GalleryCard key={entry.key} item={entry.item} />
                )
              )}
            </div>

            {/* A canonical topic has a landing page; a retired one only exists
                on the rows still carrying it, so send those to the filtered
                gallery instead — otherwise the shelf's remaining items would
                have no route out of the home page at all. */}
            {rest > 0 && topic !== UNFILED && (
              <Link
                href={slug ? `/topic/${slug}` : `/?topic=${encodeURIComponent(topic)}`}
                className="group mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-hub-teal hover:underline"
              >
                See all {all.length} in {topic}
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            {/* The unfiled bucket has no topic value, so there is nothing to
                filter to — say so rather than linking nowhere. */}
            {rest > 0 && topic === UNFILED && (
              <p className="mt-4 text-[12.5px] text-hub-ink-faint">
                + {rest} more with no topic yet — file them in /admin and they&apos;ll move to a shelf.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
