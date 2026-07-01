'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Search,
  X,
  GraduationCap,
  Newspaper,
  AppWindow,
  Database,
  Shapes,
  Tag,
  Layers,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import {
  REGISTRY_TYPES,
  TYPE_LABEL,
  type RegistryItem,
  type RegistryFacets,
  type RegistryType,
} from '@/lib/registry-types';
import { TAG_VOCABULARY, type TagFacet } from '@/lib/tag-vocabulary';

/** Facet display order + labels for the grouped tag panel. */
const TAG_FACET_LABEL: Record<TagFacet | 'other', string> = {
  method: 'Method',
  chart: 'Chart',
  data: 'Data',
  other: 'Other',
};
const TAG_FACET_ORDER: TagFacet[] = ['method', 'chart', 'data'];
/** tag → facet, from the controlled vocabulary (lib/tag-vocabulary.ts). */
const TAG_FACET_OF = new Map(TAG_VOCABULARY.map(t => [t.tag, t.facet]));

type SortKey = 'featured' | 'az' | 'type';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Per-type icon + accent (hub palette) — the visual key shared by the type
 * filter chips and the cards, so each of the four artifact classes reads at a
 * glance. `active` = solid-fill chip classes; `tone` = the idle icon/label color.
 */
const TYPE_META: Record<
  RegistryType,
  { Icon: LucideIcon; active: string; tone: string; solid: string; soft: string; bar: string }
> = {
  Teaching: { Icon: GraduationCap, active: 'border-hub-teal bg-hub-teal text-white', tone: 'text-hub-teal', solid: 'bg-hub-teal text-white', soft: 'bg-hub-teal-soft text-hub-teal', bar: 'bg-hub-teal' },
  Blog: { Icon: Newspaper, active: 'border-hub-plum bg-hub-plum text-white', tone: 'text-hub-plum', solid: 'bg-hub-plum text-white', soft: 'bg-hub-plum-soft text-hub-plum', bar: 'bg-hub-plum' },
  App: { Icon: AppWindow, active: 'border-hub-blue bg-hub-blue text-white', tone: 'text-hub-blue', solid: 'bg-hub-blue text-white', soft: 'bg-hub-blue-soft text-hub-blue', bar: 'bg-hub-blue' },
  Dataset: { Icon: Database, active: 'border-hub-amber bg-hub-amber text-white', tone: 'text-hub-amber', solid: 'bg-hub-amber text-white', soft: 'bg-hub-amber-soft text-hub-amber', bar: 'bg-hub-amber' },
};

function GalleryCard({ item }: { item: RegistryItem }) {
  const newTab = item.external || item.openInNewTab;
  const { Icon: TypeIcon, tone, solid, soft, bar } = TYPE_META[item.type];
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
          <div className={`flex h-full w-full flex-col items-center justify-center gap-2 ${soft}`}>
            <TypeIcon size={32} strokeWidth={1.6} />
            <span className="font-serif text-xl font-semibold tracking-tight">{TYPE_LABEL[item.type]}</span>
          </div>
        )}
        {/* Type identity: color strip + prominent type pill (reads at a glance) */}
        <span className={`absolute inset-x-0 top-0 h-1 ${bar}`} />
        <span className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full ${solid} px-2 py-0.5 font-plex text-[10px] font-medium uppercase tracking-[0.06em] shadow-hub`}>
          <TypeIcon size={11} strokeWidth={2.5} />
          {TYPE_LABEL[item.type]}
        </span>
        {newTab && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center rounded-full bg-hub-card/90 p-1 text-hub-ink-soft shadow-hub backdrop-blur">
            <ArrowUpRight size={12} strokeWidth={2.5} />
          </span>
        )}
      </div>

      <div className="flex flex-grow flex-col p-4">
        {item.topic && (
          <div className={`flex items-center gap-1.5 font-plex text-[10px] uppercase tracking-[0.06em] ${tone}`}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
            <span className="text-hub-ink-faint">{item.topic}</span>
          </div>
        )}
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

  return newTab ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={item.href} className={className}>
      {inner}
    </Link>
  );
}

/** Prominent primary filter — the four artifact types, each with its own icon
 *  and accent. `Icon` inherits the chip's text color when active, else `toneClass`. */
function TypeTab({
  Icon,
  active,
  activeClass,
  toneClass,
  onClick,
  children,
}: {
  Icon: LucideIcon;
  active: boolean;
  activeClass: string;
  toneClass: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 font-plex text-[12.5px] font-medium uppercase tracking-[0.06em] transition-colors ${
        active
          ? `${activeClass} shadow-hub`
          : 'border-hub-line bg-hub-card text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink'
      }`}
    >
      <Icon size={14} strokeWidth={2.2} className={active ? undefined : toneClass} />
      {children}
    </button>
  );
}

/** Secondary filter — subject topics, sorted by frequency. */
function TopicChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1 font-plex text-[11px] uppercase tracking-[0.06em] transition-colors ${
        active
          ? 'border-hub-amber bg-hub-amber-soft text-hub-amber'
          : 'border-hub-line bg-hub-card text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink'
      }`}
    >
      {children}
    </button>
  );
}

/** Tertiary filter — tags. Ink-fill when active (distinct from the amber topic
 *  chips); multi-select with AND semantics. Not uppercased since the controlled
 *  vocabulary tags are proper names ("Choropleth", "Survey data"). */
function TagChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-2.5 py-1 font-plex text-[11px] tracking-[0.02em] transition-colors ${
        active
          ? 'border-hub-ink bg-hub-ink text-hub-paper'
          : 'border-hub-line bg-hub-card text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink'
      }`}
    >
      {children}
    </button>
  );
}

/** Disclosure trigger shared by the Topic and Tags filter groups — collapsed by
 *  default so the filter bar stays compact (especially on mobile); expands to
 *  reveal the chip panel below it. `count` badges how many are active. */
function FilterToggle({
  icon: Icon,
  label,
  count,
  expanded,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-plex text-[11px] uppercase tracking-[0.06em] transition-colors ${
        count > 0
          ? 'border-hub-line-strong bg-hub-card text-hub-ink'
          : 'border-hub-line bg-hub-card text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink'
      }`}
    >
      <Icon size={12} strokeWidth={2.2} />
      {label}
      {count > 0 ? ` · ${count}` : ''}
      <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
  );
}

/** A single active-filter value shown next to its (possibly collapsed) toggle,
 *  removable without expanding the panel. */
function RemovableChip({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-hub-ink bg-hub-ink px-2.5 py-1 font-plex text-[11px] text-hub-paper"
    >
      {children} <X size={11} strokeWidth={2.5} />
    </button>
  );
}

export function GalleryExplorer({ items, facets }: { items: RegistryItem[]; facets: RegistryFacets }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<RegistryType | 'all'>('all');
  const [topic, setTopic] = useState<string | 'all'>('all');
  const [tags, setTags] = useState<string[]>([]);
  const [showTopics, setShowTopics] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [sort, setSort] = useState<SortKey>('featured');

  // Honor ?type= and ?tag= (comma-separated) filters from the URL on load. Read
  // client-side after mount so the page stays statically cached and there's no
  // hydration mismatch (e.g. the book's "Browse the gallery" → /?type=Teaching).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('type');
    if (t && (REGISTRY_TYPES as string[]).includes(t)) setType(t as RegistryType);
    const tg = params.get('tag');
    if (tg) {
      const valid = new Set(facets.tags.map(x => x.tag));
      const picked = tg.split(',').map(s => s.trim()).filter(s => valid.has(s));
      if (picked.length) {
        setTags(picked);
        setShowTags(true);
      }
    }
    // facets is stable for the page's lifetime — read once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTag = (tag: string) =>
    setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = items.filter(
      i =>
        (type === 'all' || i.type === type) &&
        (topic === 'all' || i.topic === topic) &&
        (tags.length === 0 || tags.every(t => i.tags.includes(t))) &&
        (q === '' ||
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.topic ?? '').toLowerCase().includes(q) ||
          (i.domain ?? '').toLowerCase().includes(q) ||
          i.tags.some(t => t.toLowerCase().includes(q)))
    );
    if (sort === 'az') return [...out].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'type')
      return [...out].sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
    return [...out].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [items, query, type, topic, tags, sort]);

  // Tags grouped by vocabulary facet (method/chart/data); any non-vocab tags
  // still on older non-Blog items fall under "Other". Only tags present in the
  // catalog show, each with its global count (facets.tags is frequency-sorted).
  const tagGroups = useMemo(() => {
    const groups: { facet: TagFacet | 'other'; label: string; tags: { tag: string; count: number }[] }[] =
      TAG_FACET_ORDER.map(facet => ({
        facet,
        label: TAG_FACET_LABEL[facet],
        tags: facets.tags.filter(t => TAG_FACET_OF.get(t.tag) === facet),
      }));
    const other = facets.tags.filter(t => !TAG_FACET_OF.has(t.tag));
    if (other.length) groups.push({ facet: 'other', label: TAG_FACET_LABEL.other, tags: other });
    return groups.filter(g => g.tags.length);
  }, [facets.tags]);

  const hasFilters = query !== '' || type !== 'all' || topic !== 'all' || tags.length > 0;

  return (
    <div>
      {/* Sticky filter bar — type, search, and topic controls stay in reach as
          the gallery scrolls. Sits just below the sticky hub header. Two compact
          rows by default (type+search, then the Topic/Tags/Sort controls);
          Topic and Tags each disclose their full chip list on demand instead of
          taking permanent vertical space — this matters most on mobile, where
          every always-visible row costs a full line. */}
      <div className="sticky top-14 z-30 -mx-5 border-b border-hub-line bg-hub-paper/95 px-5 pb-3 pt-3 backdrop-blur-md sm:-mx-7 sm:px-7">
        {/* Row 1 — primary filter (type) + search, side by side */}
        <div className="flex items-center gap-2">
          <div className="flex max-w-[52%] shrink-0 gap-1.5 overflow-x-auto no-scrollbar sm:max-w-none">
            <TypeTab
              Icon={Shapes}
              active={type === 'all'}
              activeClass="border-hub-ink bg-hub-ink text-hub-paper"
              toneClass="text-hub-ink-faint"
              onClick={() => setType('all')}
            >
              All · {facets.total}
            </TypeTab>
            {facets.types.map(t => {
              const meta = TYPE_META[t.type];
              return (
                <TypeTab
                  key={t.type}
                  Icon={meta.Icon}
                  active={type === t.type}
                  activeClass={meta.active}
                  toneClass={meta.tone}
                  onClick={() => setType(t.type)}
                >
                  {t.label} · {t.count}
                </TypeTab>
              );
            })}
          </div>

          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-hub-ink-faint"
            />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
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
        </div>

        {/* Row 2 — Topic + Tags disclosures (with any active values pinned next
            to their toggle) and Sort, pushed to the far end. */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {facets.topics.length > 0 && (
            <>
              <FilterToggle
                icon={Layers}
                label="Topic"
                count={topic === 'all' ? 0 : 1}
                expanded={showTopics}
                onClick={() => setShowTopics(s => !s)}
              />
              {topic !== 'all' && <RemovableChip onRemove={() => setTopic('all')}>{topic}</RemovableChip>}
            </>
          )}

          {facets.tags.length > 0 && (
            <>
              <FilterToggle
                icon={Tag}
                label="Tags"
                count={tags.length}
                expanded={showTags}
                onClick={() => setShowTags(s => !s)}
              />
              {tags.map(t => (
                <RemovableChip key={t} onRemove={() => toggleTag(t)}>
                  {t}
                </RemovableChip>
              ))}
            </>
          )}

          {(topic !== 'all' || tags.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setTopic('all');
                setTags([]);
              }}
              className="font-plex text-[11px] text-hub-teal hover:underline"
            >
              clear
            </button>
          )}

          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            aria-label="Sort"
            className="ml-auto rounded-md border border-hub-line bg-hub-card px-2.5 py-1.5 font-plex text-[12px] uppercase tracking-[0.06em] text-hub-ink-soft focus:border-hub-teal focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="az">A–Z</option>
            <option value="type">By type</option>
          </select>
        </div>

        {/* Topic panel — single-select, disclosed on demand */}
        {showTopics && facets.topics.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 rounded-xl border border-hub-line bg-hub-card/50 p-3">
            <TopicChip active={topic === 'all'} onClick={() => setTopic('all')}>
              All
            </TopicChip>
            {facets.topics.map(t => (
              <TopicChip key={t.topic} active={topic === t.topic} onClick={() => setTopic(t.topic)}>
                {t.topic} · {t.count}
              </TopicChip>
            ))}
          </div>
        )}

        {/* Tags panel — grouped by facet, multi-select (AND), disclosed on demand */}
        {showTags && facets.tags.length > 0 && (
          <div className="mt-2.5 max-h-[42vh] space-y-2.5 overflow-y-auto rounded-xl border border-hub-line bg-hub-card/50 p-3">
            {tagGroups.map(g => (
              <div key={g.facet} className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
                <span className="shrink-0 pt-1 font-plex text-[10px] uppercase tracking-[0.1em] text-hub-ink-faint sm:w-12">
                  {g.label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {g.tags.map(t => (
                    <TagChip key={t.tag} active={tags.includes(t.tag)} onClick={() => toggleTag(t.tag)}>
                      {t.tag} · {t.count}
                    </TagChip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mb-5 mt-4 font-plex text-[11.5px] uppercase tracking-[0.06em] text-hub-ink-faint">
        {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setType('all');
              setTopic('all');
              setTags([]);
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
          Nothing matches those filters.
        </p>
      )}
    </div>
  );
}
