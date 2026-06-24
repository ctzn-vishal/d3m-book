// Single source of truth for constants shared across the Tigris → gallery
// pipeline scripts (rebuild-manifest, sync-*, inject-chrome, gen-story-sitemap,
// gen-thumbnails, verify-content, sync-registry). Import from here instead of
// re-hardcoding values per script.

/**
 * The live content bucket. Served at content.vishalsingh.org. Override with
 * TIGRIS_CONTENT_BUCKET if it ever moves.
 *
 * NOTE: this is intentionally NOT `process.env.TIGRIS_BUCKET_NAME` — that env
 * var points at a different/legacy bucket and is unused by these scripts. Keep
 * the bucket name here so there's one place to change it.
 */
export const CONTENT_BUCKET = process.env.TIGRIS_CONTENT_BUCKET || 'vishal';

/**
 * Existing article slugs that use underscores instead of lowercase-kebab. The
 * files are already published and linked, so they can't be renamed without
 * breaking URLs — they're grandfathered. The non-kebab hygiene check (in
 * rebuild-manifest + verify-content) skips these so it only flags NEW drift.
 */
export const LEGACY_NONKEBAB_SLUGS = new Set([
  'american_evenings',
  'broken_u_curve',
  'community_compensation',
  'felt_despair',
  'flip_counties',
  'great_unwinding',
  'happiness_borders',
  'plateau_in_the_tail',
  'smiles_and_ladders',
  'stress_decade',
  'thin_cushion',
  'thriving_by_party',
  'two_clocks',
]);
