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
 * Sub-folders under articles/ that also hold data stories. Files at
 * articles/<sub>/<slug>.html are ingested with id = <slug> (flat id space —
 * rebuild-manifest guards collisions), served from their real key, thumbnails
 * at articles/<sub>/<slug>/_thumb.webp. Non-HTML assets in the folder
 * (style.css, charts.js, *.md) are ignored by the pipeline.
 */
export const ARTICLE_SUBDIRS = ['HF', 'india'];

/**
 * Article slugs ingested with status 'unlisted' instead of 'published':
 * booklet CHAPTERS (each booklet's cover page is itself a normal published story
 * card). Unlisted = publicly served, in the sitemap, OG-injected, but NOT a card
 * in the gallery grid — readers reach these through the booklet.
 */
export const UNLISTED_ON_INGEST = new Set([
  // American Stories (cover: articles/HF/american-stories-booklet.html). The
  // last three chapters aren't uploaded yet — listed so they ingest correctly
  // whenever they land.
  'earthquake-everyones-story',
  'triangle-fire-public-failure',
  'wilmington-coup-order',
  'votes-after-victory',
  'prohibition-moral-career',
  'automobile-public-danger',
  'the-dead-they-didnt-count',
  'the-war-the-papers-wanted',
  'mask-and-sermon-pilot',
  'american-stories-methodological-note',
  'american-stories-thematic-agenda',
  // The Political Ad Ledger — India (cover: articles/india/the-political-ad-ledger.html).
  'ledger-1-whats-in-the-data',
  'ad-election-anatomy',
  'shadow-campaign',
  'govt-second-advertiser',
  'ledger-5-what-the-ads-say',
]);

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
