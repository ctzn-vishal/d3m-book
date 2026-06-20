import snapshot from '@/content/registry.snapshot.json';
import {
  REGISTRY_TYPES,
  TYPE_LABEL,
  type RegistryItem,
  type RegistryType,
  type RegistryFacets,
} from '@/lib/registry-types';

/**
 * The unified gallery registry — single source of truth for every gallery item
 * (Teaching studios, Blog data stories, Apps, Datasets). The authoritative store
 * is the Turso `gallery` table (the curation surface; edit rows there). This file
 * reads the COMMITTED SNAPSHOT (content/registry.snapshot.json), regenerated from
 * Turso by `pnpm sync-registry`, so the build never depends on the DB.
 *
 * Live Turso reads (so curation edits show without a redeploy) live in the
 * server-only lib/registry-db.ts and fall back here. Sync readers below are used
 * by stable-at-build consumers (CaseRef, chapter rails, sitemap).
 */

export * from '@/lib/registry-types';

const SNAPSHOT = ((snapshot as { items?: RegistryItem[] }).items ?? []) as RegistryItem[];

/** Public origin for Tigris-hosted content (studios + data stories + datasets). */
export const CONTENT_URL = (process.env.NEXT_PUBLIC_CONTENT_URL || 'https://content.vishalsingh.org').replace(/\/$/, '');
export function contentUrl(path: string): string {
  return `${CONTENT_URL}/${path.replace(/^\//, '')}`;
}

export function sortItems(items: RegistryItem[]): RegistryItem[] {
  return [...items].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || (a.sort ?? 0) - (b.sort ?? 0) || a.title.localeCompare(b.title)
  );
}

/** All published items from the committed snapshot (sync; stable at build time). */
export function snapshotItems(): RegistryItem[] {
  return sortItems(SNAPSHOT.filter(i => i.status === 'published'));
}

/** Look up any item by id (incl. hidden) — used by the in-book <CaseRef>. */
export function getRegistryItem(id: string): RegistryItem | undefined {
  return SNAPSHOT.find(i => i.id === id);
}

/** Published items paired to any of the given chapter article slugs (the `teaching` field). */
export function itemsForChapter(articleSlugs: string[]): RegistryItem[] {
  const set = new Set(articleSlugs);
  return snapshotItems().filter(i => i.teaching && set.has(i.teaching));
}

export function getRegistryFacets(items: RegistryItem[]): RegistryFacets {
  const typeCounts = new Map<RegistryType, number>();
  const topicCounts = new Map<string, number>();
  for (const it of items) {
    typeCounts.set(it.type, (typeCounts.get(it.type) ?? 0) + 1);
    if (it.topic) topicCounts.set(it.topic, (topicCounts.get(it.topic) ?? 0) + 1);
  }
  return {
    types: REGISTRY_TYPES.filter(t => typeCounts.has(t)).map(t => ({ type: t, label: TYPE_LABEL[t], count: typeCounts.get(t)! })),
    // Secondary filter: topics sorted by frequency.
    topics: [...topicCounts.entries()]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic)),
    total: items.length,
  };
}
