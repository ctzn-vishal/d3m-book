import { REGISTRY_TYPES, type RegistryType, type RegistryStatus } from '@/lib/registry-types';
import { TOPICS } from '@/lib/taxonomy';
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

/** The curated fields /admin v1 may change (metadata only — no content/create/delete). */
export type RowPatch = Partial<
  Pick<AdminRow, 'type' | 'status' | 'featured' | 'topic' | 'title' | 'description' | 'tags' | 'teaching'>
>;

/**
 * Server actions return this instead of throwing. Next.js redacts thrown
 * Server Action error messages in production builds (replaced with a
 * generic "An error occurred..." + digest), so a validation message like
 * "invalid type: Foo" would never reach the curator — returning it instead
 * passes it through untouched.
 */
export type ActionResult = { ok: true } | { ok: false; error: string };
