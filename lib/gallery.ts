import { studios } from '@/lib/studios';
import { domainToTopic } from '@/lib/taxonomy';
import galleryRegistry from '@/content/gallery.json';

/**
 * The unified gallery registry. ONE loader (`getGalleryItems`) merges:
 *   1. studios auto-derived from lib/studios.ts (so adding an HTML studio there
 *      surfaces it here automatically), and
 *   2. content/gallery.json — the hand-edited curation surface: `items`
 *      (standalone apps/articles/datasets) + `curate` (per-id overrides for the
 *      derived studios: featured / status / topic / tags / teaching / …).
 *
 * This is the swappable seam: moving the source to Turso later is a change to
 * this file only. Reads are filtered to `status === 'published'`.
 *
 * Link model: an item renders as a new-tab <a> when `external` OR `openInNewTab`
 * (all standalone HTML artifacts + live apps); otherwise as in-app navigation
 * (reserved for future internal routes like /datasets/[id]).
 */

export type GalleryType =
  | 'studio'
  | 'dashboard'
  | 'case'
  | 'app'
  | 'article'
  | 'dataset'
  | 'presentation';

export type GalleryStatus = 'published' | 'hidden' | 'draft';

export type GalleryItem = {
  id: string;
  type: GalleryType;
  title: string;
  description: string;
  domain?: string;
  /** Canonical subject facet (controlled vocabulary — see lib/taxonomy.ts). */
  topic?: string;
  tags: string[];
  /** Slug of the book article/chapter this pairs with, if any. */
  teaching?: string;
  href: string;
  external: boolean;
  openInNewTab?: boolean;
  thumbnail?: string;
  accent: string;
  featured: boolean;
  status: GalleryStatus;
  /** For proxied apps: intended hub mount path once the origin sets basePath. */
  proxyPath?: string;
};

export const TYPE_LABEL: Record<GalleryType, string> = {
  studio: 'Studio',
  dashboard: 'Dashboard',
  case: 'Case study',
  app: 'App',
  article: 'Data story',
  dataset: 'Dataset',
  presentation: 'Presentation',
};

type CurateMap = Record<string, Partial<GalleryItem>>;

const registryItems = ((galleryRegistry as { items?: unknown }).items ?? []) as unknown as GalleryItem[];
const curate = ((galleryRegistry as { curate?: unknown }).curate ?? {}) as CurateMap;

/** Studios → gallery items. Self-contained HTML; opens in a new tab. */
function studioBase(): GalleryItem[] {
  return studios.map(s => ({
    id: s.slug,
    type: s.kind === 'exercise' ? ('case' as const) : ('dashboard' as const),
    title: s.title,
    description: s.blurb,
    domain: s.domain,
    topic: domainToTopic(s.domain),
    tags: s.methodTags,
    teaching: s.relatedSlug,
    href: `/studios/${s.slug}/index.html`,
    external: false,
    openInNewTab: true,
    thumbnail: s.preview.src,
    accent: s.accent,
    featured: false,
    status: 'published' as GalleryStatus,
  }));
}

/** Every item, curation applied, before status filtering. */
function allItems(): GalleryItem[] {
  const base = [...studioBase(), ...registryItems];
  return base.map(it => (curate[it.id] ? { ...it, ...curate[it.id] } : it));
}

export function getGalleryItems(opts?: { includeHidden?: boolean }): GalleryItem[] {
  const items = allItems().filter(i => opts?.includeHidden || i.status === 'published');
  // featured-first, stable otherwise (the explorer re-sorts on demand).
  return items.sort((a, b) => Number(b.featured) - Number(a.featured));
}

export function getGalleryItem(id: string): GalleryItem | undefined {
  return allItems().find(i => i.id === id);
}

export function getFeaturedItems(limit = 6): GalleryItem[] {
  return getGalleryItems()
    .filter(i => i.featured)
    .slice(0, limit);
}

export type GalleryFacets = {
  types: { type: GalleryType; label: string; count: number }[];
  topics: { topic: string; count: number }[];
  tags: { tag: string; count: number }[];
  total: number;
};

export function getGalleryFacets(items: GalleryItem[] = getGalleryItems()): GalleryFacets {
  const typeCounts = new Map<GalleryType, number>();
  const topicCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  for (const it of items) {
    typeCounts.set(it.type, (typeCounts.get(it.type) ?? 0) + 1);
    if (it.topic) topicCounts.set(it.topic, (topicCounts.get(it.topic) ?? 0) + 1);
    for (const t of it.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  return {
    types: [...typeCounts.entries()]
      .map(([type, count]) => ({ type, label: TYPE_LABEL[type], count }))
      .sort((a, b) => b.count - a.count),
    topics: [...topicCounts.entries()]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic)),
    tags: [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)),
    total: items.length,
  };
}
