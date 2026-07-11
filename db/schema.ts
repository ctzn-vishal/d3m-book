import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Drizzle schema for the Turso `gallery` registry — used ONLY by Drizzle Studio
 * (`pnpm studio`) to give a spreadsheet-style CMS editor: `type` and `status`
 * render as DROPDOWNS and the boolean flags as CHECKBOXES. The app itself reads
 * the table via @libsql (lib/registry-db.ts), not Drizzle.
 *
 * NOTE: the `{ enum }` lists below are TypeScript/Studio metadata only — they do
 * NOT enforce values in the database. Real validity is enforced by CHECK
 * constraints on the table (scripts/migrate-gallery.mjs): type ∈ App/Teaching/
 * Blog/Dataset, status ∈ published/hidden/draft, flags ∈ 0/1. Keep this schema in
 * sync with the table if columns change.
 */
export const gallery = sqliteTable('gallery', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['App', 'Teaching', 'Blog', 'Dataset'] }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  domain: text('domain'),
  topic: text('topic'),
  /** JSON array stored as text, e.g. ["data story","politics"]. */
  tags: text('tags'),
  /** Paired book chapter/article slug (the in-book "Featured" rails). */
  teaching: text('teaching'),
  href: text('href').notNull(),
  external: integer('external', { mode: 'boolean' }).notNull().default(false),
  openInNewTab: integer('open_in_new_tab', { mode: 'boolean' }).notNull().default(false),
  thumbnail: text('thumbnail'),
  accent: text('accent'),
  /** Floats the item to the top of the gallery. */
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  status: text('status', { enum: ['published', 'hidden', 'draft'] }).notNull().default('published'),
  /** Lower sorts earlier (within the same featured group). */
  sort: integer('sort').notNull().default(0),
  /** ISO-ish 'YYYY-MM-DD HH:MM:SS' (UTC) timestamps — set by datetime('now'). */
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

/**
 * Social post review queue (Level-2 social pipeline). Rows are created by
 * scripts/social-drafts.ts and reviewed at /admin/social; scripts/social-deliver.mjs
 * hands approved X drafts to Typefully. Same caveat as `gallery`: the enums here
 * are Studio metadata — real validity is the CHECK constraints in the CREATE
 * TABLE (scripts/social-drafts.ts).
 */
export const socialQueue = sqliteTable('social_queue', {
  id: text('id').primaryKey(), // <item_id>:<platform>:<yyyymmdd>
  itemId: text('item_id').notNull(),
  platform: text('platform', { enum: ['x', 'linkedin', 'instagram'] }).notNull(),
  status: text('status', { enum: ['draft', 'approved', 'posted', 'rejected'] }).notNull().default('draft'),
  text: text('text').notNull(),
  linkUrl: text('link_url').notNull(),
  imageUrl: text('image_url'),
  /** The core finding all three platform drafts share. */
  hook: text('hook'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
  postedAt: text('posted_at'),
});
