import { REGISTRY_TYPES, type RegistryType, type RegistryStatus } from '@/lib/registry-types';
import { TOPICS } from '@/lib/taxonomy';
import { COLLECTIONS } from '@/lib/collections';
import { allArticles } from '@/lib/book-toc';

/** Dropdown vocabularies — the SAME lists the DB CHECK constraints enforce. */
export const TYPE_OPTIONS: RegistryType[] = [...REGISTRY_TYPES];
export const STATUS_OPTIONS: RegistryStatus[] = ['published', 'hidden', 'draft', 'unlisted'];
export const TOPIC_OPTIONS: string[] = [...TOPICS];

/**
 * Book article slugs a gallery row may pair with, in reading order. Sourced from
 * book-toc so a chapter rename can never leave a dangling `teaching` value —
 * which would silently drop the item from that chapter's "Featured" rail rather
 * than erroring (lib/registry.ts#itemsForChapter matches on exact slug).
 */
export const TEACHING_OPTIONS: Array<{ slug: string; label: string }> = allArticles.map(a => ({
  slug: a.slug,
  label: `§${a.number} ${a.title}`,
}));

/** A gallery row as the admin table edits it (serializable; passed server→client). */
export type AdminRow = {
  id: string;
  type: RegistryType;
  title: string;
  description: string;
  topic: string | null;
  tags: string[];
  teaching: string | null;
  /** Collection slug (lib/collections.ts), or null if the item stands alone. */
  collection: string | null;
  /** 1-based position within an ordered collection; null for unordered sets. */
  part: number | null;
  status: RegistryStatus;
  featured: boolean;
  sort: number;
  href: string;
  thumbnail: string | null;
  accent: string | null;
  domain: string | null;
  external: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

/**
 * The curated fields /admin may change (metadata only — no content/create/delete).
 *
 * `createdAt` is editable because most of the catalog was bulk-imported and
 * carries an ingest timestamp rather than a publication date — three distinct
 * months across 181 rows — which makes any "recently added" ordering
 * meaningless until the real dates are backfilled.
 */
export type RowPatch = Partial<
  Pick<
    AdminRow,
    | 'type'
    | 'status'
    | 'featured'
    | 'topic'
    | 'title'
    | 'description'
    | 'tags'
    | 'teaching'
    | 'createdAt'
    | 'collection'
    | 'part'
  >
>;

/** Fields the bulk editor may set across a selection. Deliberately narrower
 *  than RowPatch — title/description/tags/part are per-row by nature. */
export type BulkPatch = Partial<Pick<AdminRow, 'type' | 'status' | 'featured' | 'topic' | 'collection'>>;

/** Collection slugs offered in the admin dropdowns. */
export const COLLECTION_OPTIONS: Array<{ slug: string; label: string }> = COLLECTIONS.map(c => ({
  slug: c.slug,
  label: c.title,
}));

/**
 * Server actions return this instead of throwing. Next.js redacts thrown
 * Server Action error messages in production builds (replaced with a
 * generic "An error occurred..." + digest), so a validation message like
 * "invalid type: Foo" would never reach the curator — returning it instead
 * passes it through untouched.
 */
export type ActionResult = { ok: true } | { ok: false; error: string };
