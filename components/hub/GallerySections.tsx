'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { RegistryItem } from '@/lib/registry-types';
import { GalleryCard } from '@/components/hub/GalleryCard';
import { CollectionCard } from '@/components/hub/CollectionCard';
import { findCollection, type Collection } from '@/lib/collections';
import { galleryTopicOrder, topicSlug, TOPIC_META } from '@/lib/taxonomy';

/** Cards rendered into a shelf before the "+ N more" tile takes over. */
const PER_SECTION = 10;

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
 * One horizontally scrolling row. Native overflow scrolling with snap points —
 * no carousel library, so touch, trackpad, and shift-wheel all behave the way
 * the platform already does; the arrows are an affordance on top, shown only on
 * pointer-capable widths and only when there is somewhere to go.
 *
 * The row is a labelled, focusable region so keyboard users can scroll it with
 * the arrow keys instead of tabbing through every card to reach the end.
 */
function Shelf({
  label,
  heading,
  blurb,
  children,
}: {
  label: string;
  /** The left-hand side of the header line — title, count, "see all". */
  heading: React.ReactNode;
  blurb?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  // Re-measure on resize as well as on scroll: a row that overflows at 1280px
  // may fit at 1600px, and a stale `atEnd` would leave a dead arrow on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sync]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 260), behavior: 'smooth' });
  };

  const arrow =
    'hidden h-8 w-8 items-center justify-center rounded-full border border-hub-line bg-hub-card text-hub-ink-soft transition-colors hover:border-hub-line-strong hover:text-hub-ink disabled:cursor-default disabled:opacity-30 disabled:hover:border-hub-line disabled:hover:text-hub-ink-soft md:inline-flex';

  return (
    <>
      {/* Header line: heading on the left, paging arrows pinned to the right so
          they sit on the section rule rather than floating over the cards. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {heading}
        {/* A row that already fits shows no arrows at all — a pair of dead
            controls reads as breakage, not as "you've seen everything". */}
        <div className={`ml-auto hidden shrink-0 items-center gap-1.5 ${atStart && atEnd ? '' : 'md:flex'}`}>
          <button type="button" onClick={() => page(-1)} disabled={atStart} aria-label={`Scroll ${label} backward`} className={arrow}>
            <ChevronLeft size={16} strokeWidth={2.2} />
          </button>
          <button type="button" onClick={() => page(1)} disabled={atEnd} aria-label={`Scroll ${label} forward`} className={arrow}>
            <ChevronRight size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {blurb}

      {/* Full-bleed to the container edge so a partially visible card at the
          margin advertises that the row continues. */}
      <div className="relative -mx-5 mt-5 sm:-mx-7">
        <div
          ref={ref}
          onScroll={sync}
          role="region"
          aria-label={label}
          tabIndex={0}
          // pt/pb leave room for the cards' hover lift and shadow, which the
          // scroll container would otherwise clip.
          className="no-scrollbar flex snap-x scroll-px-5 gap-5 overflow-x-auto px-5 pb-4 pt-2 sm:scroll-px-7 sm:px-7"
        >
          {children}
        </div>
        {!atStart && (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-hub-paper to-transparent" />
        )}
        {!atEnd && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-hub-paper to-transparent" />
        )}
      </div>
    </>
  );
}

/**
 * The default (unfiltered) gallery: one horizontal shelf per topic instead of a
 * single ~180-card grid running 35 viewports.
 *
 * `topic` is singular, so shelves *partition* the catalog — every item appears
 * on exactly one. That makes the risk of a row layout the tail: anything past
 * the fold of the row is behind a gesture. Two things answer that, and both are
 * always visible without scrolling the row: the "See all N" link in the heading,
 * and the "+ N more" tile the row ends on. The topic page is the real home for
 * the full set; the shelf is a window onto it, not a substitute.
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
        // Collapse collections first, then take the top entries — a five-part
        // series occupies one slot, not five, which is the point.
        const entries = collapse(all, collectionSizes).sort((a, b) => Number(b.featured) - Number(a.featured));
        const shown = entries.slice(0, PER_SECTION);
        // Count in ITEMS, not entries: ten cards can already represent more than
        // ten pieces once a collection is folded in, and the "more" affordances
        // should appear whenever the topic page holds something the shelf doesn't.
        const itemsShown = shown.reduce((n, e) => n + (e.kind === 'collection' ? e.members.length : 1), 0);
        const rest = all.length - itemsShown;
        const slug = topic === UNFILED ? undefined : topicSlug(topic);
        const blurb =
          topic === UNFILED
            ? undefined
            : (TOPIC_META as Record<string, { blurb: string } | undefined>)[topic]?.blurb;
        // A canonical topic has a landing page; a retired one only exists on the
        // rows still carrying it, so send those to the filtered gallery instead
        // — otherwise the shelf's tail would have no route out of the home page.
        const seeAll = slug ? `/topic/${slug}` : `/?topic=${encodeURIComponent(topic)}`;

        return (
          <section key={topic} className="border-t border-hub-line py-10 first:border-0 first:pt-4">
            <Shelf
              label={topic}
              // Heading — deliberately loud. The topic is the organizing idea of
              // the row, so it carries display type, its own count, and the
              // escape hatch to the full set, all on one line.
              heading={
                <>
                  <h2 className="font-serif text-[clamp(22px,2.6vw,29px)] font-semibold leading-[1.1] tracking-tight text-hub-ink">
                    {topic === UNFILED ? (
                      topic
                    ) : (
                      <Link href={seeAll} className="transition-colors hover:text-hub-teal">
                        {topic}
                      </Link>
                    )}
                  </h2>

                  <span className="inline-flex shrink-0 items-center rounded-full border border-hub-line bg-hub-card px-2.5 py-1 font-plex text-[11px] font-medium tracking-[0.04em] text-hub-ink-soft">
                    {all.length}
                  </span>

                  {rest > 0 && topic !== UNFILED && (
                    <Link
                      href={seeAll}
                      className="group inline-flex items-center gap-1.5 font-plex text-[11.5px] font-medium uppercase tracking-[0.06em] text-hub-teal hover:underline"
                    >
                      See all {all.length}
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </>
              }
              blurb={
                blurb ? (
                  <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-hub-ink-soft">{blurb}</p>
                ) : undefined
              }
            >
              {shown.map(entry => (
                // Block wrapper, not flex: the row stretches it to the tallest
                // card, and the card's own `h-full` then resolves against it.
                <div key={entry.key} className="w-[80vw] max-w-[320px] shrink-0 snap-start sm:w-[300px] xl:w-[318px]">
                  {entry.kind === 'collection' ? (
                    <CollectionCard collection={entry.collection} members={entry.members} total={entry.total} />
                  ) : (
                    <GalleryCard item={entry.item} />
                  )}
                </div>
              ))}

              {/* Terminal tile. The row's own answer to "what am I not seeing"
                  — it states the remainder as a number rather than leaving it
                  implied by a scrollbar that isn't drawn. */}
              {rest > 0 && topic !== UNFILED && (
                <Link
                  href={seeAll}
                  className="group flex w-[52vw] max-w-[210px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-hub-line-strong bg-hub-card/40 px-4 py-6 text-center transition-colors hover:border-hub-teal hover:bg-hub-teal-soft/40 sm:w-[200px]"
                >
                  <span className="font-serif text-[34px] font-semibold leading-none tracking-tight text-hub-ink transition-colors group-hover:text-hub-teal">
                    +{rest}
                  </span>
                  <span className="font-plex text-[10.5px] uppercase tracking-[0.08em] text-hub-ink-faint">
                    more {rest === 1 ? 'piece' : 'pieces'}
                  </span>
                  <span className="mt-1 max-w-[16ch] text-[12.5px] leading-snug text-hub-ink-soft">in {topic}</span>
                  <span className="mt-2.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-hub-teal">
                    See all {all.length}
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )}
            </Shelf>

            {/* The unfiled bucket has no topic value, so there is nothing to
                filter to — say so rather than linking nowhere. */}
            {rest > 0 && topic === UNFILED && (
              <p className="mt-3 text-[12.5px] text-hub-ink-faint">
                + {rest} more with no topic yet — file them in /admin and they&apos;ll move to a shelf.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
