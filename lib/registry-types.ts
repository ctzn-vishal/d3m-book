// Primary gallery taxonomy — artifact class maps each item to ONE of four types.
// Kept dependency-free so client components (GalleryExplorer) can import the
// labels/types without pulling in the snapshot JSON or the Turso client.

export type RegistryType = 'Teaching' | 'Blog' | 'App' | 'Dataset';

/** Display order for the primary type filter (most prominent first). */
export const REGISTRY_TYPES: RegistryType[] = ['Teaching', 'Blog', 'App', 'Dataset'];

export const TYPE_LABEL: Record<RegistryType, string> = {
  Teaching: 'Teaching',
  Blog: 'Blog',
  App: 'App',
  Dataset: 'Dataset',
};

/** One-liner shown under each primary type chip. */
export const TYPE_BLURB: Record<RegistryType, string> = {
  Teaching: 'Interactive studios paired to the book',
  Blog: 'Data stories & essays',
  App: 'Standalone interactive apps',
  Dataset: 'Downloadable datasets',
};

export type RegistryStatus = 'published' | 'hidden' | 'draft';

export type RegistryItem = {
  id: string;
  type: RegistryType;
  title: string;
  description: string;
  domain?: string;
  /** Canonical subject facet (secondary filter) — see lib/taxonomy.ts. */
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
  status: RegistryStatus;
  sort?: number;
  /** 'YYYY-MM-DD HH:MM:SS' (UTC) — from the Turso row; absent in older snapshots. */
  createdAt?: string;
  updatedAt?: string;
};

export type RegistryFacets = {
  types: { type: RegistryType; label: string; count: number }[];
  topics: { topic: string; count: number }[];
  tags: { tag: string; count: number }[];
  total: number;
};
