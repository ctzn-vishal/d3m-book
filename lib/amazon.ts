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
