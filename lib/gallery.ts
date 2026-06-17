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

/** Public base URL for Tigris-hosted content (the `vishal` bucket / its CDN). */
const CONTENT_URL = (process.env.NEXT_PUBLIC_CONTENT_URL || 'https://vishal.t3.tigrisfiles.io').replace(/\/$/, '');

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

type ManifestItem = {
  id: string;
  title: string;
  description?: string;
  topic?: string;
  tags?: string[];
  file: string;
  thumb?: string | null;
  accent?: string;
  featured?: boolean;
  status?: GalleryStatus;
};

/**
 * Articles = data stories hosted in the Tigris `vishal` bucket. Read from its
 * manifest.json via ISR (revalidate), so adding a story to the bucket + manifest
 * refreshes the gallery with no redeploy. Repo-side `curate` overrides still apply.
 * Returns [] if the manifest is unreachable (gallery still renders studios+apps).
 */
export async function getArticleItems(): Promise<GalleryItem[]> {
  try {
    const res = await fetch(`${CONTENT_URL}/articles/manifest.json`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: ManifestItem[] };
    return (data.items ?? [])
      .map<GalleryItem>(m => ({
        id: m.id,
        type: 'article',
        title: m.title,
        description: m.description ?? '',
        topic: m.topic,
        tags: m.tags?.length ? m.tags : ['data story'],
        href: `${CONTENT_URL}/${m.file}`,
        external: true,
        openInNewTab: true,
        thumbnail: m.thumb ? `${CONTENT_URL}/${m.thumb}` : undefined,
        accent: m.accent ?? '#46688f',
        featured: !!m.featured,
        status: m.status ?? 'published',
      }))
      .map(it => (curate[it.id] ? { ...it, ...curate[it.id] } : it))
      .filter(i => i.status === 'published');
  } catch {
    return [];
  }
}

export type DatasetColumn = {
  name: string;
  dtype: string;
  nullPct: number | null;
  unique: number | null;
  examples: (string | number)[];
};

export type DatasetRecord = {
  id: string;
  title: string;
  description: string;
  topic?: string;
  tags: string[];
  format: string;
  rows: number | null;
  cols: number | null;
  grain: string;
  useCases: string[];
  source: string;
  confidence?: string;
  sizeBytes: number | null;
  sha256: string;
  file: string;
  accent: string;
  featured: boolean;
  status: GalleryStatus;
  columns: DatasetColumn[];
};

async function fetchDatasetManifest(): Promise<DatasetRecord[]> {
  try {
    const res = await fetch(`${CONTENT_URL}/datasets/manifest.json`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: DatasetRecord[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

/** Datasets → gallery items (internal links to the /datasets/[id] viewer). */
export async function getDatasetItems(): Promise<GalleryItem[]> {
  const recs = await fetchDatasetManifest();
  return recs
    .map<GalleryItem>(d => ({
      id: d.id,
      type: 'dataset',
      title: d.title,
      description: d.description,
      topic: d.topic,
      tags: d.tags?.length ? d.tags : ['dataset'],
      href: `/datasets/${d.id}`,
      external: false,
      openInNewTab: false,
      accent: d.accent ?? '#46688f',
      featured: !!d.featured,
      status: d.status ?? 'published',
    }))
    .map(it => (curate[it.id] ? { ...it, ...curate[it.id] } : it))
    .filter(i => i.status === 'published');
}

export async function getDataset(id: string): Promise<DatasetRecord | undefined> {
  return (await fetchDatasetManifest()).find(d => d.id === id);
}

/** Absolute URL for a bucket-relative content path (article HTML, dataset file). */
export function contentUrl(path: string): string {
  return `${CONTENT_URL}/${path.replace(/^\//, '')}`;
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
