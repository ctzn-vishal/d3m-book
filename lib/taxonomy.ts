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

/**
 * Per-topic landing-page metadata: the URL slug for /topic/[slug] and a short
 * editorial intro (also the page's meta description — keep it ~120–160 chars).
 * Kept dependency-free (client components import topicSlug for links).
 */
export const TOPIC_META: Record<Topic, { slug: string; blurb: string }> = {
  'Elections & Voting': {
    slug: 'elections-voting',
    blurb:
      'Presidential returns, county swings, turnout, and the electoral map — interactive atlases and data stories on how America votes.',
  },
  'Polarization & Public Opinion': {
    slug: 'polarization-public-opinion',
    blurb:
      'Party sorting, attitude gaps, and long-run survey trends — how American opinion divides, shifts, and hardens across groups and decades.',
  },
  'Happiness & Well-Being': {
    slug: 'happiness-well-being',
    blurb:
      'Life satisfaction, time use, stress, and social connection — what large surveys reveal about how Americans are actually doing.',
  },
  'Health & Mortality': {
    slug: 'health-mortality',
    blurb:
      'Life expectancy, overdose deaths, chronic disease, and the geography of health across states, counties, and ZIP codes.',
  },
  'Religion & Belief': {
    slug: 'religion-belief',
    blurb:
      'Religious affiliation, practice, and belief — the reshaping of American religious life, told through survey data.',
  },
  'Demographics & Society': {
    slug: 'demographics-society',
    blurb:
      'Population change, migration, family structure, and the social fabric — the long-run shifts beneath the headlines.',
  },
  'Consumer & Household Finance': {
    slug: 'consumer-household-finance',
    blurb:
      'Spending, saving, debt, and financial fragility — how American households earn, borrow, and manage money.',
  },
  'Inequality & Mobility': {
    slug: 'inequality-mobility',
    blurb:
      'Income and wealth gaps, economic mobility, and who gets ahead — evidence across places, cohorts, and generations.',
  },
  'Business & Markets': {
    slug: 'business-markets',
    blurb:
      'Pricing, competition, advertising, and market structure — data stories and teaching cases from the business world.',
  },
  'Methods, AI & Data': {
    slug: 'methods-ai-data',
    blurb:
      'The craft itself: visualization, causal inference, machine learning, and AI — methods explained with real data.',
  },
};

const SLUG_TO_TOPIC = new Map<string, Topic>(TOPICS.map(t => [TOPIC_META[t].slug, t]));

/** URL slug for a canonical topic ('Health & Mortality' → 'health-mortality'); undefined for non-canonical strings. */
export function topicSlug(topic: string): string | undefined {
  return (TOPIC_META as Record<string, { slug: string }>)[topic]?.slug;
}

/** Canonical topic for a /topic/[slug] param, or undefined for an unknown slug. */
export function topicFromSlug(slug: string): Topic | undefined {
  return SLUG_TO_TOPIC.get(slug);
}

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
