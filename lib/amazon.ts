/**
 * Registry of Amazon-reviews analyses.
 *
 * Adding a new analysis is two steps: append an entry here, and create
 * `app/amazon/<slug>/page.tsx`. The hub index, the sub-navigation, and the
 * sitemap all read from this list, so nothing else needs touching.
 *
 * Analyses that draw on a different slice of the corpus (a text sample, a
 * single category, a scraped supplement) declare it in `source` — the pages
 * built on the 507M-review aggregates and the ones built on a 50K-review text
 * sample should never be mistaken for each other.
 */

export interface Analysis {
  /** URL segment under /amazon. */
  slug: string;
  /** Card and nav title. */
  title: string;
  /** One line for the index card. */
  blurb: string;
  /** What the analysis is computed over. Shown on the card and the page. */
  source: string;
  /** Rough reading time, shown on the card. */
  minutes: number;
  /** ISO date the analysis was published or last substantially revised. */
  updated: string;
  /** Draft entries render as a dimmed, unlinked card. */
  status: 'live' | 'planned';
  /** Short topic tags for the card. */
  tags: string[];
}

export const ANALYSES: Analysis[] = [
  {
    slug: 'reviewers',
    title: 'The rater in the rating',
    blurb:
      'Who actually writes reviews, and how much of a star rating is about them rather than the product. One-time reviewers give one star 2.5× as often as regulars.',
    source: 'Phase 2 — user-grain aggregates',
    minutes: 10,
    updated: '2026-08-09',
    status: 'live',
    tags: ['selection', 'reviewers', 'inequality'],
  },
  {
    slug: 'item-dynamics',
    title: 'How a product’s rating forms',
    blurb:
      'Rating by review index, the first-review effect, and the shape of a contested product. Items whose first review was 1★ run half a star lower forever after.',
    source: 'Phase 2 — item-grain aggregates',
    minutes: 9,
    updated: '2026-08-09',
    status: 'live',
    tags: ['herding', 'item dynamics', 'cross-category'],
  },
  {
    slug: 'review-quality',
    title: 'What a review is made of',
    blurb:
      'Helpful votes, length, photos, duplicate text, and the verified-purchase joint that reverses the headline correlation.',
    source: 'Phase 2 — Tier 0 aggregates',
    minutes: 8,
    updated: '2026-08-09',
    status: 'live',
    tags: ['helpfulness', 'text', 'simpson’s paradox'],
  },
  {
    slug: 'daily',
    title: 'Ten thousand days',
    blurb:
      'The full daily series, 1996–2023. The biggest review days in Amazon’s history are not Prime Day or Black Friday — they are the first week of January.',
    source: 'Phase 2 — daily series',
    minutes: 6,
    updated: '2026-08-09',
    status: 'live',
    tags: ['time series', 'seasonality', 'events'],
  },
  {
    slug: 'cross-category',
    title: 'What reviewers buy next',
    blurb:
      'Category breadth, the 33×33 co-occurrence matrix, and where a reviewer goes after their last review.',
    source: 'Phase 2 — cross-category matrices',
    minutes: 7,
    updated: '2026-08-09',
    status: 'live',
    tags: ['cross-category', 'networks', 'reviewers'],
  },
  {
    slug: 'catalogue',
    title: 'What’s on the shelf',
    blurb:
      'Prices, brand concentration, and the attribute vocabulary of 35M products — plus two measures the corpus simply cannot answer.',
    source: 'Phase 2 — item metadata',
    minutes: 7,
    updated: '2026-08-09',
    status: 'live',
    tags: ['prices', 'concentration', 'metadata'],
  },
  {
    slug: 'seasonality',
    title: 'When people write reviews',
    blurb:
      'Month, weekday, and hour across all 33 categories — and the December-buys / January-receives pattern hiding in the gift categories.',
    source: 'Full aggregate — 507.7M reviews',
    minutes: 8,
    updated: '2026-08-08',
    status: 'live',
    tags: ['seasonality', 'gifting', 'cross-category'],
  },
  {
    slug: 'growth',
    title: 'Twenty-eight years, and 3.7% of them',
    blurb:
      'Volume and mean rating by year, per category. Why the long history contributes almost nothing to a pooled average, and what the 2013 jump and the 2021 peak actually were.',
    source: 'Full aggregate — 507.7M reviews',
    minutes: 6,
    updated: '2026-08-08',
    status: 'live',
    tags: ['time series', 'composition', 'ratings'],
  },
];

export const LIVE_ANALYSES = ANALYSES.filter(a => a.status === 'live');

export function findAnalysis(slug: string): Analysis | undefined {
  return ANALYSES.find(a => a.slug === slug);
}
