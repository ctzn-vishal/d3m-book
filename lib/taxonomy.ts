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
  'Media, News & Advertising',
  'Growing Up in America',
  'Health & Mortality',
  'Happiness & Well-Being',
  'Business & Markets',
  'Consumer & Household Finance',
  'Inequality & Mobility',
  'Demographics & Society',
  'Schools & Universities',
  'Religion & Belief',
  'AI & Language Models',
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
  'Schools & Universities': {
    slug: 'schools-universities',
    blurb:
      'Colleges, school districts, and the people they produce — cost and earnings, alumni networks, grade inflation, and who gets through.',
  },
  'Media, News & Advertising': {
    slug: 'media-news-advertising',
    blurb:
      'The press, the archive, and the ad ledger — how stories get told, what gets covered, and who pays to be seen.',
  },
  'Growing Up in America': {
    slug: 'growing-up-in-america',
    blurb:
      'Adolescence in the data: mental health, school, sleep, substances, politics, and belief among American teens across five decades.',
  },
  'AI & Language Models': {
    slug: 'ai-language-models',
    blurb:
      'What language models can and cannot measure — benchmarks, meaning, bias, and using LLMs as instruments on real data.',
  },
};

/**
 * Retired topics kept as read-only aliases so `/topic/<old-slug>` never 404s.
 *
 * 'Methods, AI & Data' was removed because it was the only entry answering *how*
 * a piece was done rather than *what it is about* — which is why it grew into
 * the largest bucket and swallowed items belonging to Business & Markets and
 * elsewhere. Method now lives in the tag vocabulary (lib/tag-vocabulary.ts,
 * `method` facet), where it composes with any subject.
 *
 * Rows in Turso may still carry a retired topic until they are re-filed in
 * /admin; the gallery renders whatever it finds (see galleryTopicOrder), so
 * nothing disappears in the meantime.
 */
export const RETIRED_TOPIC_SLUGS: Record<string, string> = {
  'methods-ai-data': 'ai-language-models',
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

/**
 * Section order for the gallery, in three tiers:
 *
 *   1. `curated` — the order set by drag-and-drop in /admin (the `topic_order`
 *      table). Empty when nothing has been curated yet.
 *   2. Canonical topics the curated list doesn't mention, in TOPICS order. This
 *      is what lets a topic be ADDED to the vocabulary without anyone having to
 *      re-save the order in /admin first.
 *   3. Anything else actually present on rows — a retired value not yet
 *      re-filed — alphabetically, so a stale topic still renders a section
 *      instead of silently hiding its items.
 *
 * Tier 3 matters more than it looks. Under the old flat grid an unfiled or
 * retired row still appeared somewhere; under a sectioned layout anything not
 * matched by a section is invisible. Deriving the order from
 * `curated ∪ TOPICS ∪ present` makes it impossible to lose a row by editing the
 * vocabulary — or by saving a partial order.
 */
export function galleryTopicOrder(present: Iterable<string>, curated: readonly string[] = []): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (t: string) => {
    if (!t || seen.has(t)) return;
    seen.add(t);
    out.push(t);
  };

  for (const t of curated) push(t);
  for (const t of TOPICS) push(t);
  for (const t of [...new Set(present)].sort()) push(t);
  return out;
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
  'Global Media': 'Media, News & Advertising',
  Advertising: 'Media, News & Advertising',
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
