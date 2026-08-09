'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Shapes,
  Tag,
  Layers,
  ChevronDown,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import {
  REGISTRY_TYPES,
  type RegistryItem,
  type RegistryFacets,
  type RegistryType,
} from '@/lib/registry-types';
import { TAG_VOCABULARY, type TagFacet } from '@/lib/tag-vocabulary';
import { GalleryCard, TYPE_META } from '@/components/hub/GalleryCard';
import { GallerySections } from '@/components/hub/GallerySections';
import { topicSlug } from '@/lib/taxonomy';

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

const EASE = [0.22, 1, 0.36, 1] as const;

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

export function GalleryExplorer({
  items,
  facets,
  collectionSizes = {},
}: {
  items: RegistryItem[];
  facets: RegistryFacets;
  /** slug → total members incl. unlisted, so a series whose parts are unlisted
   *  still collapses to one card instead of showing as a lone item. */
  collectionSizes?: Record<string, number>;
}) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<RegistryType | 'all'>('all');
  const [topic, setTopic] = useState<string | 'all'>('all');
  const [tags, setTags] = useState<string[]>([]);
  const [showTopics, setShowTopics] = useState(false);
  const [showTags, setShowTags] = useState(false);

  // Honor ?type=, ?topic=, ?tag= (comma-separated), and ?q= filters from the URL
  // on load. Read client-side after mount so the page stays statically cached and
  // there's no hydration mismatch (e.g. the book's "Browse the gallery" →
  // /?type=Teaching).
  const skipUrlSync = useRef(true);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('type');
    if (t && (REGISTRY_TYPES as string[]).includes(t)) setType(t as RegistryType);
    const tp = params.get('topic');
    if (tp && facets.topics.some(x => x.topic === tp)) setTopic(tp);
    const tg = params.get('tag');
    if (tg) {
      const valid = new Set(facets.tags.map(x => x.tag));
      const picked = tg.split(',').map(s => s.trim()).filter(s => valid.has(s));
      if (picked.length) {
        setTags(picked);
        setShowTags(true);
      }
    }
    const q = params.get('q');
    if (q) setQuery(q);
    // facets is stable for the page's lifetime — read once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect filter state back into the URL (replaceState — no history spam) so a
  // filtered view is shareable/bookmarkable. The first run is skipped: it fires
  // with default state before the mount-read above has applied, and writing then
  // would wipe the incoming params.
  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (topic !== 'all') params.set('topic', topic);
    if (tags.length) params.set('tag', tags.join(','));
    if (query.trim()) params.set('q', query.trim());
    const qs = params.toString();
    try {
      window.history.replaceState(null, '', (qs ? `?${qs}` : window.location.pathname) + window.location.hash);
    } catch {
      // Safari rate-limits replaceState — dropping an update is harmless here.
    }
  }, [type, topic, tags, query]);

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
    // Featured items float to the top — an editorial/curation choice, not a
    // user-facing sort option (the Featured/A–Z/By-type selector was removed).
    return [...out].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [items, query, type, topic, tags]);

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
          rows by default (type only, then Topic/Tags + search); Topic and Tags
          each disclose their full chip list on demand instead of taking
          permanent vertical space — this matters most on mobile, where every
          always-visible row costs a full line. */}
      <div className="sticky top-14 z-30 -mx-5 border-b border-hub-line bg-hub-paper/95 px-5 pb-3 pt-3 backdrop-blur-md sm:-mx-7 sm:px-7">
        {/* Row 1 — primary filter (type) */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
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

        {/* Row 2 — Topic + Tags disclosures (with any active values pinned next
            to their toggle), and search, pushed to the far end. */}
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

          <div className="relative min-w-[180px] flex-1 sm:ml-auto sm:max-w-[240px] sm:flex-none">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-hub-ink-faint"
            />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-full border border-hub-line bg-hub-card py-2 pl-10 pr-9 text-[14px] text-hub-ink placeholder:text-hub-ink-faint focus:border-hub-teal focus:outline-none focus:ring-2 focus:ring-hub-teal/30"
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
        {hasFilters ? (
          <>
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
          </>
        ) : (
          <>Browse by topic · {items.length} pieces</>
        )}
        {topic !== 'all' && topicSlug(topic) && (
          <Link
            href={`/topic/${topicSlug(topic)}`}
            className="ml-3 inline-flex items-center gap-0.5 normal-case tracking-normal text-hub-teal hover:underline"
          >
            {topic} topic page <ArrowUpRight size={12} strokeWidth={2.5} />
          </Link>
        )}
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

      {/* Two modes. Browsing (no filters) gets topic shelves — a flat grid of
          ~180 cards runs 35 viewports and offers no way in. Searching or
          filtering gets the flat animated grid, because once you've narrowed to
          a set, grouping it again just adds chrome between you and the answer. */}
      {!hasFilters ? (
        <GallerySections items={filtered} collectionSizes={collectionSizes} />
      ) : (
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
      )}

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-hub-line-strong bg-hub-card p-10 text-center text-hub-ink-soft">
          Nothing matches those filters.
        </p>
      )}
    </div>
  );
}
