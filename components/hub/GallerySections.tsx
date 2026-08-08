'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { RegistryItem } from '@/lib/registry-types';
import { GalleryCard } from '@/components/hub/GalleryCard';
import { galleryTopicOrder, topicSlug, TOPIC_META } from '@/lib/taxonomy';

/** Items shown per shelf before the "see all" link takes over. */
const PER_SECTION = 6;

/** Bucket for rows with no topic — always last, and never silently dropped. */
const UNFILED = 'More from the catalog';

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
export function GallerySections({ items }: { items: RegistryItem[] }) {
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
        // Featured first within a shelf, so the six on show are the six chosen.
        const sorted = [...all].sort((a, b) => Number(b.featured) - Number(a.featured));
        const shown = sorted.slice(0, PER_SECTION);
        const rest = all.length - shown.length;
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
              {shown.map(item => (
                <GalleryCard key={`${item.type}-${item.id}`} item={item} />
              ))}
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
