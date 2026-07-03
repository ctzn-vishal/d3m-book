/**
 * Canonical gallery topics — the SUBJECT facet (what a piece is about), distinct
 * from tags (how it's done; see lib/tag-vocabulary.ts).
 *
 * A controlled list, but designed to GROW: as the catalog fills out in themed
 * batches, a recurring sub-theme graduates to its own topic once it crosses
 * ~8–10 items (Religion and Consumer & Household Finance are seeded ahead of
 * their incoming batches). `pnpm curate-new` surfaces candidate new topics when
 * an item fits none of these well, so the list tracks the corpus instead of
 * sprawling into near-duplicates. Studios map their `domain` → a topic via
 * DOMAIN_TO_TOPIC; per-item overrides live in Turso (the curated `topic` column).
 */
export const TOPICS = [
  'Elections & Voting',
  'Polarization & Public Opinion',
  'Happiness & Well-Being',
  'Health & Mortality',
  'Religion & Belief',
  'Demographics & Society',
  'Consumer & Household Finance',
  'Inequality & Mobility',
  'Business & Markets',
  'Methods, AI & Data',
] as const;

export type Topic = (typeof TOPICS)[number];

const DOMAIN_TO_TOPIC: Record<string, string> = {
  Politics: 'Elections & Voting',
  Elections: 'Elections & Voting',
  'Public Opinion': 'Polarization & Public Opinion',
  'Public Health': 'Health & Mortality',
  'Public Safety': 'Health & Mortality',
  Demographics: 'Demographics & Society',
  'Consumer Finance': 'Consumer & Household Finance',
  'Household Finance': 'Consumer & Household Finance',
  'Public Finance': 'Inequality & Mobility',
  'Global Media': 'Business & Markets',
  Advertising: 'Business & Markets',
  Marketplaces: 'Business & Markets',
  'CPG & Pricing': 'Business & Markets',
  Airlines: 'Business & Markets',
  Restaurants: 'Business & Markets',
  Mobility: 'Business & Markets',
};

/**
 * Maps a studio's `domain` to a canonical topic. Returns `undefined` (not the
 * raw domain string) when there's no match — `topic` has no CHECK constraint
 * in Turso, so writing an uncontrolled value would silently escape the
 * vocabulary. An unmatched domain gets the same treatment as a new article
 * with no topic: `null` in Turso, set by the curator in /admin.
 */
export function domainToTopic(domain?: string): string | undefined {
  if (!domain) return undefined;
  return DOMAIN_TO_TOPIC[domain];
}
