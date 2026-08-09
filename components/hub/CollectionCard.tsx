import Link from 'next/link';
import Image from 'next/image';
import { Layers, ArrowRight } from 'lucide-react';
import type { Collection } from '@/lib/collections';
import { collectionHref } from '@/lib/collections';
import type { RegistryItem } from '@/lib/registry-types';

/**
 * Stands in for a whole collection in the gallery grid, so a five-part series
 * reads as one thing rather than five loose cards competing with each other.
 *
 * Shaped like GalleryCard on purpose — same footprint, same hover — but marked
 * with a stacked-layers cue and a part count so it's clearly a container.
 */
export function CollectionCard({
  collection,
  members,
  total,
}: {
  collection: Collection;
  /** The members visible in this context — used only for artwork. */
  members: RegistryItem[];
  /** Every member, including unlisted parts the gallery never lists. */
  total?: number;
}) {
  const href = collectionHref(collection);
  // Borrow the first member's artwork; a collection has no image of its own.
  const thumb = members.find(m => m.thumbnail)?.thumbnail;
  const count = Math.max(total ?? 0, members.length);

  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-hub-line bg-hub-card shadow-hub transition-all duration-200 hover:-translate-y-0.5 hover:border-hub-line-strong"
    >
      {/* Stacked-paper edge — the visual tell that this is many pieces. */}
      <span
        aria-hidden
        className="absolute inset-x-3 -top-1 h-2 rounded-t-xl border border-b-0 border-hub-line bg-hub-paper2"
      />

      {thumb && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-hub-paper2">
          <Image
            src={thumb}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <span className="inline-flex items-center gap-1.5 font-plex text-[10px] uppercase tracking-[0.12em] text-hub-teal">
          <Layers size={11} strokeWidth={2.2} />
          {count} {count === 1 ? 'part' : 'parts'}
          {collection.status === 'building' ? ' · ongoing' : ''}
        </span>

        <h3 className="mt-2 font-serif text-[17px] font-semibold leading-snug text-hub-ink transition-colors group-hover:text-hub-teal">
          {collection.title}
        </h3>
        <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-hub-ink-soft">{collection.blurb}</p>

        <span className="mt-3 inline-flex items-center gap-1.5 border-t border-hub-line pt-2.5 text-[12px] font-medium text-hub-ink-faint transition-colors group-hover:text-hub-teal">
          Open the collection
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
