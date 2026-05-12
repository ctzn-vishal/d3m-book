/**
 * Per-article data manifests. Each entry tells `scripts/fetch-book-data.mjs`
 * which JSONs to pull (e.g., from a Tigris bucket) for a given chapter.
 *
 * Empty for D3M v1 — chart data is committed locally under
 * `app/<slug>/data/*.json` and imported directly. Populate this when we
 * move to bucket-hosted assets (Phase 7).
 */
export const articles = [];
