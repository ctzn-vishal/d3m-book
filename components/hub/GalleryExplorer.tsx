'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Search, X } from 'lucide-react';
import type { GalleryItem, GalleryFacets, GalleryType } from '@/lib/gallery';
import { TYPE_LABEL } from '@/lib/gallery';

type SortKey = 'featured' | 'az' | 'type';

const EASE = [0.22, 1, 0.36, 1] as const;

function GalleryCard({ item }: { item: GalleryItem }) {
  const inner = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-hub-paper2">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: `rgb(var(--hub-paper2))` }}
          >
            <span className="font-serif text-2xl font-semibold tracking-tight" style={{ color: item.accent }}>
              {TYPE_LABEL[item.type]}
            </span>
          </div>
        )}
        {/* accent rule + live badge */}
        <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: item.accent }} />
        {item.external && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-hub-card/90 px-2 py-0.5 font-plex text-[10px] uppercase tracking-[0.06em] text-hub-ink-soft shadow-hub backdrop-blur">
            <ArrowUpRight size={11} strokeWidth={2.5} /> live
          </span>
        )}
      </div>

      <div className="flex flex-grow flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="font-plex text-[10px] uppercase tracking-[0.05em]" style={{ color: item.accent }}>
            {TYPE_LABEL[item.type]}
          </span>
          {item.domain && (
            <>
              <span className="text-hub-ink-faint">·</span>
              <span className="font-plex text-[10px] uppercase tracking-[0.05em] text-hub-ink-faint">
                {item.domain}
              </span>
            </>
          )}
        </div>
        <h3 className="mt-1.5 font-serif text-[17px] font-semibold leading-snug text-hub-ink">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-grow text-[13px] leading-relaxed text-hub-ink-soft">
          {item.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map(t => (
            <span
              key={t}
              className="rounded border border-hub-line bg-hub-paper2 px-1.5 py-0.5 font-plex text-[10px] text-hub-ink-soft"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const className =
    'group flex h-full flex-col overflow-hidden rounded-2xl border border-hub-line bg-hub-card shadow-hub transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-hub-line-strong no-underline';

  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={item.href} className={className}>
      {inner}
    </Link>
  );
}

function TypeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 font-plex text-[11.5px] uppercase tracking-[0.06em] transition-colors ${
        active
          ? 'border-hub-teal bg-hub-teal-soft text-hub-teal'
          : 'border-hub-line bg-hub-card text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink'
      }`}
    >
      {children}
    </button>
  );
}

export function GalleryExplorer({ items, facets }: { items: GalleryItem[]; facets: GalleryFacets }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<GalleryType | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('featured');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = items.filter(
      i =>
        (type === 'all' || i.type === type) &&
        (q === '' ||
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.domain ?? '').toLowerCase().includes(q) ||
          i.tags.some(t => t.toLowerCase().includes(q)))
    );
    if (sort === 'az') return [...out].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'type')
      return [...out].sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
    return [...out].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [items, query, type, sort]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-grow">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-hub-ink-faint"
          />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search dashboards, data stories, apps…"
            className="w-full rounded-full border border-hub-line bg-hub-card py-2.5 pl-10 pr-9 text-[14px] text-hub-ink placeholder:text-hub-ink-faint focus:border-hub-teal focus:outline-none focus:ring-2 focus:ring-hub-teal/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-hub-ink-faint hover:text-hub-ink"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 font-plex text-[11px] uppercase tracking-[0.08em] text-hub-ink-faint">
          Sort
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="rounded-md border border-hub-line bg-hub-card px-2.5 py-2 font-plex text-[12px] uppercase tracking-[0.06em] text-hub-ink-soft focus:border-hub-teal focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="az">A–Z</option>
            <option value="type">By type</option>
          </select>
        </label>
      </div>

      {/* Type chips */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
        <TypeChip active={type === 'all'} onClick={() => setType('all')}>
          All · {facets.total}
        </TypeChip>
        {facets.types.map(t => (
          <TypeChip key={t.type} active={type === t.type} onClick={() => setType(t.type)}>
            {t.label} · {t.count}
          </TypeChip>
        ))}
      </div>

      <p className="mb-5 mt-4 font-plex text-[11.5px] uppercase tracking-[0.06em] text-hub-ink-faint">
        {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        {(query || type !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setType('all');
            }}
            className="ml-3 text-hub-teal hover:underline"
          >
            reset
          </button>
        )}
      </p>

      {/* Animated grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map(item => (
            <motion.div
              key={`${item.type}-${item.id}`}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.24, ease: EASE }}
            >
              <GalleryCard item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-hub-line-strong bg-hub-card p-10 text-center text-hub-ink-soft">
          Nothing matches “{query}” in {type === 'all' ? 'any type' : TYPE_LABEL[type]}.
        </p>
      )}
    </div>
  );
}
