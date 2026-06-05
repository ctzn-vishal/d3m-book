import type { Metadata } from 'next';
import Link from 'next/link';
import { book } from '@/lib/book-toc';
import { createPreviewMetadata } from '@/lib/share-metadata';
import { studios, relatedChapter, type StudioCollection } from '@/lib/studios';
import StudiosGallery, { type ActiveGalleryFilter, type GalleryStudio } from './StudiosGallery';

const pageTitle = `Case Study & Dashboard Gallery | ${book.title}`;
const pageDescription =
  'Interactive, self-contained dashboards and hands-on exercises that pair with the book — pricing, regression, exploratory views, and more.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  ...createPreviewMetadata({
    title: pageTitle,
    description: pageDescription,
    imagePath: '/studios/opengraph-image',
    imageAlt: 'D3M case study and dashboard gallery preview card',
  }),
};

type StudiosSearchParams = {
  collection?: string | string[];
  method?: string | string[];
};

type Props = {
  searchParams?: Promise<StudiosSearchParams>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function resolveActiveFilter(
  params: StudiosSearchParams | undefined,
  galleryStudios: GalleryStudio[],
): ActiveGalleryFilter {
  const availableCollections = new Set<StudioCollection>(
    galleryStudios.flatMap(studio => studio.collections),
  );
  const availableMethods = new Set(galleryStudios.flatMap(studio => studio.methodTags));

  const collection = firstParam(params?.collection);
  if (collection && availableCollections.has(collection as StudioCollection)) {
    return { type: 'collection', value: collection as StudioCollection };
  }

  const method = firstParam(params?.method);
  if (method && availableMethods.has(method)) {
    return { type: 'method', value: method };
  }

  return { type: 'all', value: 'all' };
}

export default async function StudiosGalleryPage({ searchParams }: Props) {
  const galleryStudios: GalleryStudio[] = studios.map(studio => ({
    ...studio,
    related: relatedChapter(studio),
  }));
  const activeFilter = resolveActiveFilter(await searchParams, galleryStudios);

  return (
    <div className="bg-surface text-body min-h-screen flex flex-col">
      {/* Top bar — mirrors the article shell's sticky book bar. */}
      <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 lg:px-10 py-2.5">
          <Link
            href="/"
            className="text-sm font-display font-semibold text-body hover:text-link transition-colors truncate"
          >
            {book.title}
          </Link>
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted hover:text-body hover:bg-card transition-colors"
          >
            ← Back to book
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-[#EDF2F7] via-[#F4F8FC] to-[#FFFFFF]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Interactive Studios</p>
          <h1 className="mt-3 font-display font-semibold tracking-tight text-body text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">
            Case Study &amp; Dashboard Gallery
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-subtle leading-snug">
            Live, self-contained dashboards and hands-on exercises. Each one takes a
            method from the book off the page and onto real data — explore it directly,
            then jump to the chapter it pairs with.
          </p>
        </div>
      </section>

      <StudiosGallery activeFilter={activeFilter} studios={galleryStudios} />

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 text-xs text-muted">
          {studios.length} interactive studios · part of {book.title}.
        </div>
      </footer>
    </div>
  );
}
