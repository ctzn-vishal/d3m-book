import { studios } from '@/lib/studios';

/**
 * The unified gallery registry. ONE loader (`getGalleryItems`) merges every
 * content source into a single `GalleryItem[]` so the gallery page never knows
 * where an item came from. This is the swappable seam: when articles/datasets
 * move to Tigris (Phase 2) or a DB later, only this file changes.
 *
 * Link model:
 *   - internal (`external: false`) → in-app navigation (studios, datasets)
 *   - external (`external: true`)  → cross-zone <a target="_blank"> (proxied apps)
 */

export type GalleryType =
  | 'studio'
  | 'dashboard'
  | 'case'
  | 'app'
  | 'article'
  | 'dataset'
  | 'presentation';

export type GalleryItem = {
  id: string;
  type: GalleryType;
  title: string;
  description: string;
  domain?: string;
  tags: string[];
  href: string;
  /** true → render as a plain cross-zone anchor (new tab); false → next/link */
  external: boolean;
  thumbnail?: string;
  accent: string;
  featured: boolean;
  /**
   * For proxied apps: the intended hub mount path (via next.config rewrites)
   * once the origin sets `basePath`. Until then `href` points at the live
   * deployment so the gallery works today. See next.config.ts.
   */
  proxyPath?: string;
};

/** Human label per type, used by the filter chips and card badges. */
export const TYPE_LABEL: Record<GalleryType, string> = {
  studio: 'Studio',
  dashboard: 'Dashboard',
  case: 'Case study',
  app: 'App',
  article: 'Data story',
  dataset: 'Dataset',
  presentation: 'Presentation',
};

/** A curated set of studios to feature on the home + gallery hero. */
const FEATURED_STUDIO_SLUGS = new Set<string>([
  'presidential-election-atlas',
  'nyc-airbnb-atlas',
  'share-of-wallet',
  'southwest-regression',
  'gdelt-media-agenda-lab',
  'religious-composition-dashboard',
]);

/** Studios → gallery items (internal links into the existing /studios viewer). */
function studioItems(): GalleryItem[] {
  return studios.map(s => ({
    id: s.slug,
    type: s.kind === 'exercise' ? 'case' : 'dashboard',
    title: s.title,
    description: s.blurb,
    domain: s.domain,
    tags: s.methodTags,
    href: `/studios/${s.slug}`,
    external: false,
    thumbnail: s.preview.src,
    accent: s.accent,
    featured: FEATURED_STUDIO_SLUGS.has(s.slug),
  }));
}

/**
 * Externally-deployed apps + data stories (Tier C). For v1 the cards open the
 * live deployment in a new tab; `proxyPath` records where each will mount under
 * the hub once its origin sets `basePath` (see next.config.ts rewrite block).
 */
const HUB_APPS: GalleryItem[] = [
  {
    id: 'well-being-atlas',
    type: 'article',
    title: 'The Well-Being Atlas',
    description:
      'A publication of reproducible data essays on life satisfaction — Gallup World Poll, GSS, and WVS microdata across 50 years and 168 countries.',
    domain: 'Well-being',
    tags: ['well-being', 'gallup', 'global', 'data story'],
    href: 'https://well-being-atlas.vercel.app/',
    external: true,
    accent: '#2f6f6b',
    featured: true,
    proxyPath: '/atlas/well-being',
  },
  {
    id: 'world-trade-atlas',
    type: 'app',
    title: 'World Trade Atlas',
    description:
      'A bilateral goods-trade explorer — 226 countries × 5,021 products, 1995–2024 (CEPII BACI), with country profiles, comparisons, and stories.',
    domain: 'Trade',
    tags: ['trade', 'geography', 'baci', 'explorer'],
    href: 'https://world-trade-atlas.vercel.app/',
    external: true,
    accent: '#46688f',
    featured: true,
    proxyPath: '/atlas/trade',
  },
  {
    id: 'zip-health',
    type: 'app',
    title: 'Health of America’s ZIP Codes',
    description:
      'A map-first atlas of 26 health and social-need measures across 32,409 ZIP/ZCTAs (CDC PLACES + Census), with stories and methodology.',
    domain: 'Public health',
    tags: ['public-health', 'zip', 'places', 'maps'],
    href: 'https://health-of-americas-zip-codes.vercel.app/',
    external: true,
    accent: '#7a4a6e',
    featured: false,
    proxyPath: '/apps/zip-health',
  },
  {
    id: 'ai-models',
    type: 'app',
    title: 'AI Models & Benchmarks',
    description:
      'A filterable, sortable comparison of frontier and open-weight models — context windows, pricing, modalities, and access.',
    domain: 'AI reference',
    tags: ['ai', 'benchmarks', 'reference', 'table'],
    href: 'https://v0-interactive-table-lac.vercel.app/',
    external: true,
    accent: '#b9762a',
    featured: false,
    proxyPath: '/apps/ai-models',
  },
  {
    id: 'scrc-data',
    type: 'app',
    title: 'Research Data Gallery — SCRC & Dewey',
    description:
      'A research-data gallery surfacing curated datasets for teaching and analysis.',
    domain: 'Research data',
    tags: ['research-data', 'gallery', 'datasets'],
    href: 'https://scrc-data.vercel.app/',
    external: true,
    accent: '#2f6f6b',
    featured: false,
    proxyPath: '/apps/scrc',
  },
];

/** THE loader. Order: featured-first within a stable type ordering. */
export function getGalleryItems(): GalleryItem[] {
  return [...HUB_APPS, ...studioItems()];
}

export function getFeaturedItems(limit = 6): GalleryItem[] {
  return getGalleryItems()
    .filter(i => i.featured)
    .slice(0, limit);
}

export type GalleryFacets = {
  types: { type: GalleryType; label: string; count: number }[];
  tags: { tag: string; count: number }[];
  total: number;
};

/** Filter facets derived live from the data (no hand-maintained lists). */
export function getGalleryFacets(items: GalleryItem[] = getGalleryItems()): GalleryFacets {
  const typeCounts = new Map<GalleryType, number>();
  const tagCounts = new Map<string, number>();
  for (const it of items) {
    typeCounts.set(it.type, (typeCounts.get(it.type) ?? 0) + 1);
    for (const t of it.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  return {
    types: [...typeCounts.entries()]
      .map(([type, count]) => ({ type, label: TYPE_LABEL[type], count }))
      .sort((a, b) => b.count - a.count),
    tags: [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)),
    total: items.length,
  };
}
