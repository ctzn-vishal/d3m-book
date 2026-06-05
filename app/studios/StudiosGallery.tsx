import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpenCheck,
  FlaskConical,
  LayoutDashboard,
  Newspaper,
  Search,
} from 'lucide-react';
import type { Studio, StudioCollection } from '@/lib/studios';

type RelatedChapter = {
  slug: string;
  number: string;
  title: string;
} | null;

export type GalleryStudio = Studio & {
  related: RelatedChapter;
};

export type ActiveGalleryFilter =
  | { type: 'all'; value: 'all' }
  | { type: 'collection'; value: StudioCollection }
  | { type: 'method'; value: string };

const collectionLabels: Record<StudioCollection, string> = {
  teaching: 'Teaching',
  research: 'Research',
  blog: 'Blog',
};

const collectionIcons: Record<StudioCollection, typeof BookOpenCheck> = {
  teaching: BookOpenCheck,
  research: Search,
  blog: Newspaper,
};

const methodOrder = [
  'Dashboard',
  'Regression',
  'PCA / clustering',
  'Maps',
  'Pricing',
  'Time series',
  'Shock analysis',
  'Text analysis',
  'Live API',
  'Exploratory viz',
  'Segmentation',
  'Exercise',
];

function formatArticleNumber(num: string): string {
  return num.includes('.') ? `§${num}` : `Ch. ${num}`;
}

function filterKey(filter: ActiveGalleryFilter): string {
  return `${filter.type}:${filter.value}`;
}

function matchesFilter(studio: GalleryStudio, filter: ActiveGalleryFilter): boolean {
  if (filter.type === 'all') return true;
  if (filter.type === 'collection') return studio.collections.includes(filter.value);
  return studio.methodTags.includes(filter.value);
}

function sortMethodTags(tags: string[]): string[] {
  return [...tags].sort((a, b) => {
    const aIndex = methodOrder.indexOf(a);
    const bIndex = methodOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

function filterHref(filter: ActiveGalleryFilter): string {
  if (filter.type === 'all') return '/studios';
  const key = filter.type === 'collection' ? 'collection' : 'method';
  return `/studios?${key}=${encodeURIComponent(filter.value)}`;
}

function FilterLink({
  active,
  children,
  count,
  filter,
}: {
  active: boolean;
  children: React.ReactNode;
  count: number;
  filter: ActiveGalleryFilter;
}) {
  return (
    <Link
      href={filterHref(filter)}
      aria-current={active ? 'page' : undefined}
      className={[
        'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
        active
          ? 'border-body bg-body text-white'
          : 'border-border bg-surface text-muted hover:border-border-strong hover:text-body',
      ].join(' ')}
    >
      <span>{children}</span>
      <span
        className={[
          'rounded px-1.5 py-0.5 text-[11px] leading-none',
          active ? 'bg-white/15 text-white' : 'bg-card text-muted',
        ].join(' ')}
      >
        {count}
      </span>
    </Link>
  );
}

export default function StudiosGallery({
  activeFilter,
  studios,
}: {
  activeFilter: ActiveGalleryFilter;
  studios: GalleryStudio[];
}) {
  const collectionFilters = (Object.keys(collectionLabels) as StudioCollection[])
    .map(collection => ({
      collection,
      count: studios.filter(studio => studio.collections.includes(collection)).length,
    }))
    .filter(filter => filter.count > 0);

  const methodTags = new Set<string>();
  studios.forEach(studio => studio.methodTags.forEach(tag => methodTags.add(tag)));
  const methodFilters = sortMethodTags([...methodTags]).map(tag => ({
    tag,
    count: studios.filter(studio => studio.methodTags.includes(tag)).length,
  }));

  const filteredStudios = studios.filter(studio => matchesFilter(studio, activeFilter));
  const activeKey = filterKey(activeFilter);

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 lg:px-10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Collections
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <FilterLink
                  active={activeKey === 'all:all'}
                  count={studios.length}
                  filter={{ type: 'all', value: 'all' }}
                >
                  All
                </FilterLink>
                {collectionFilters.map(({ collection, count }) => {
                  const Icon = collectionIcons[collection];
                  return (
                    <FilterLink
                      key={collection}
                      active={activeKey === `collection:${collection}`}
                      count={count}
                      filter={{ type: 'collection', value: collection }}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Icon size={14} strokeWidth={2.3} aria-hidden="true" />
                        {collectionLabels[collection]}
                      </span>
                    </FilterLink>
                  );
                })}
              </div>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-muted lg:text-right">
              Showing {filteredStudios.length} of {studios.length} interactive studios.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Methods
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {methodFilters.map(({ tag, count }) => (
                <FilterLink
                  key={tag}
                  active={activeKey === `method:${tag}`}
                  count={count}
                  filter={{ type: 'method', value: tag }}
                >
                  {tag}
                </FilterLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStudios.map(studio => (
              <StudioCard key={studio.slug} studio={studio} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function StudioCard({ studio }: { studio: GalleryStudio }) {
  const KindIcon = studio.kind === 'exercise' ? FlaskConical : LayoutDashboard;
  const kindLabel = studio.kind === 'exercise' ? 'Exercise' : 'Dashboard';

  return (
    <article className="group relative flex min-h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md">
      <div className="h-1 w-full" style={{ backgroundColor: studio.accent }} aria-hidden="true" />

      <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-card">
        <Image
          src={studio.preview.src}
          alt={studio.preview.alt}
          fill
          sizes="(min-width: 1280px) 390px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          style={{ objectPosition: studio.preview.objectPosition ?? 'center' }}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/65 via-black/15 to-transparent p-4">
          <div className="flex flex-wrap gap-1.5">
            {studio.collections.map(collection => (
              <span
                key={collection}
                className="rounded bg-white/95 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-body shadow-sm"
              >
                {collectionLabels[collection]}
              </span>
            ))}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/40 bg-white/95 px-2.5 py-1 text-[11px] font-medium text-body shadow-sm">
            <KindIcon size={13} strokeWidth={2.4} aria-hidden="true" />
            {kindLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {studio.domain}
        </span>

        <h2 className="mt-2.5 font-display text-xl font-semibold leading-snug text-body">
          <Link href={`/studios/${studio.slug}`} className="hover:text-link transition-colors">
            <span className="absolute inset-0" aria-hidden="true" />
            {studio.title}
          </Link>
        </h2>

        <p className="mt-2.5 line-clamp-4 text-sm leading-relaxed text-muted">{studio.blurb}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {studio.methods.map(method => (
            <span
              key={method}
              className="rounded bg-card px-2 py-0.5 text-[11px] font-medium text-subtle"
            >
              {method}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/70 pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-link">
            Open studio
            <ArrowUpRight
              size={15}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
          {studio.related && (
            <Link
              href={`/${studio.related.slug}`}
              className="relative z-10 text-right text-xs text-muted transition-colors hover:text-link"
            >
              Pairs with {formatArticleNumber(studio.related.number)}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
