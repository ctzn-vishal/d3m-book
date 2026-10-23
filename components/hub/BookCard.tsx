import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, BookOpen, Wrench } from 'lucide-react';
import type { ShelfBook, BookKind } from '@/lib/books';

const KIND_META: Record<BookKind, { Icon: typeof BookOpen; solid: string; soft: string; bar: string }> = {
  // Card-coloured pill rather than ink: an ink fill inverts to near-white in
  // dark mode and disappears against the light book covers.
  Book: { Icon: BookOpen, solid: 'bg-hub-card/95 text-hub-ink backdrop-blur', soft: 'bg-hub-paper2 text-hub-ink-soft', bar: 'bg-hub-ink' },
  // hub-blue lightens in dark mode, so the label flips to paper there (7.4:1).
  Toolkit: { Icon: Wrench, solid: 'bg-hub-blue text-white dark:text-hub-paper', soft: 'bg-hub-blue-soft text-hub-blue', bar: 'bg-hub-blue' },
};

/** Ink on amber-soft: white on hub-amber is 3.7:1 in light and 2.4:1 in dark. */
export const IN_PROGRESS_PILL =
  'inline-flex items-center rounded-full border border-hub-amber/50 bg-hub-amber-soft px-2 py-0.5 font-plex text-[10px] font-medium uppercase tracking-[0.06em] text-hub-ink shadow-hub';

const GRID_SIZES ='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw';

/**
 * Card for the "Interactive books" shelf. Same shell as GalleryCard so the row
 * reads as part of the gallery; differs in the kind pill, the "In progress"
 * marker, and a footer naming the address the card opens.
 */
export function BookCard({ book, sizes = GRID_SIZES }: { book: ShelfBook; sizes?: string }) {
  const { Icon, solid, soft, bar } = KIND_META[book.kind];
  const inner = (
    <>
      <div className="relative aspect-[16/9] overflow-hidden bg-hub-paper2">
        {book.thumbnail ? (
          <Image
            src={book.thumbnail}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className={`flex h-full w-full flex-col items-center justify-center gap-2 ${soft}`}>
            <Icon size={32} strokeWidth={1.6} />
            <span className="font-serif text-xl font-semibold tracking-tight">{book.kind}</span>
          </div>
        )}
        <span className={`absolute inset-x-0 top-0 h-1 ${bar}`} />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full ${solid} px-2 py-0.5 font-plex text-[10px] font-medium uppercase tracking-[0.06em] shadow-hub`}>
            <Icon size={11} strokeWidth={2.5} />
            {book.kind}
          </span>
          {book.inProgress && (
            <span className={IN_PROGRESS_PILL}>
              In progress
            </span>
          )}
        </span>
        {book.newTab && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center rounded-full bg-hub-card/90 p-1 text-hub-ink-soft shadow-hub backdrop-blur">
            <ArrowUpRight size={12} strokeWidth={2.5} />
          </span>
        )}
      </div>

      <div className="flex flex-grow flex-col px-4 pb-3.5 pt-3">
        <h3 className="line-clamp-2 font-serif text-[17px] font-semibold leading-snug text-hub-ink">{book.title}</h3>
        {book.subtitle && (
          <p className="mt-0.5 line-clamp-1 font-serif text-[13.5px] italic text-hub-ink-soft">{book.subtitle}</p>
        )}
        <p className="mt-1.5 line-clamp-3 flex-grow text-[13px] leading-relaxed text-hub-ink-soft">{book.description}</p>
        <div className="mt-2.5 truncate font-plex text-[11px] tracking-[0.02em] text-hub-teal">
          {book.host}
          {book.credit && <span className="text-hub-ink-soft"> · {book.credit}</span>}
        </div>
      </div>
    </>
  );

  const className =
    'group flex h-full flex-col overflow-hidden rounded-2xl border border-hub-line bg-hub-card shadow-hub transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-hub-line-strong no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hub-teal focus-visible:ring-offset-2 focus-visible:ring-offset-hub-paper';

  // A mounted book (/zipcode, …) is another app behind a rewrite, so it needs a
  // full page load: next/link would try to client-route into this app.
  return book.internal && !book.newTab ? (
    <Link href={book.href} className={className}>
      {inner}
    </Link>
  ) : (
    <a
      href={book.href}
      target={book.newTab ? '_blank' : undefined}
      rel={book.href.startsWith('/') ? 'noopener' : 'noopener noreferrer'}
      className={className}
    >
      {inner}
    </a>
  );
}
