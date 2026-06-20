import type { RegistryStatus } from '@/lib/registry-types';

/**
 * Dataset DETAIL loader. The unified gallery registry (every Teaching/Blog/App/
 * Dataset row) now lives in lib/registry.ts, backed by Turso + a committed
 * snapshot. This file remains the source for the RICH per-dataset record —
 * column profiles, sizes, sources, teaching uses — that powers /datasets/[id],
 * read from the Tigris `datasets/manifest.json` via ISR. The gallery card for a
 * dataset comes from the registry; the detail page comes from here.
 */

/** Public origin for Tigris-hosted content. */
const CONTENT_URL = (process.env.NEXT_PUBLIC_CONTENT_URL || 'https://content.vishalsingh.org').replace(/\/$/, '');

/** Absolute URL for a bucket-relative content path (dataset file / download). */
export function contentUrl(path: string): string {
  return `${CONTENT_URL}/${path.replace(/^\//, '')}`;
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
  status: RegistryStatus;
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

/** Published dataset ids + hub hrefs — for generateStaticParams and the sitemap. */
export async function getDatasetItems(): Promise<{ id: string; href: string }[]> {
  return (await fetchDatasetManifest())
    .filter(d => (d.status ?? 'published') === 'published')
    .map(d => ({ id: d.id, href: `/datasets/${d.id}` }));
}

export async function getDataset(id: string): Promise<DatasetRecord | undefined> {
  return (await fetchDatasetManifest()).find(d => d.id === id);
}
