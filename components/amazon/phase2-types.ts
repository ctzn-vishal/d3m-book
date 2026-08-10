/**
 * Shapes of the app/amazon/data/phase2-*.json files, produced by
 * scripts/fetch-amazon-phase2.mjs from the 29 merged_results_v2 CSVs.
 *
 * These are derived, not raw: pooled series, capped indices, downsampled
 * curves. The raw release is 13.7 MB and ts_daily_all alone is 11.4 MB, so the
 * fetch script does the reduction and the pages only ever see chartable data.
 */

export interface Phase2Meta {
  generated: string;
  source: string;
  nFiles: number;
  /** The manifest's own warning that the marginal shares do not partition variance. */
  varianceWarning: string | null;
  varianceTotals: {
    nReviews: number | null;
    grandMean: number | null;
    totalVariance: number | null;
    naiveSumPct: number | null;
  };
  notes: string[];
  notPublished: Array<{ measure: string; reason: string }>;
}

export interface ActivityBucket {
  /** '1' | '2' | '3-4' | '5-9' | '10+' */
  bucket: string;
  n: number;
  mean: number;
  /** Share at 1★…5★, 0–100. */
  dist: number[];
}

export interface Reviewers {
  activity: ActivityBucket[];
  global: {
    users: number;
    reviews: number;
    perUser: number;
    gini: number;
    top1: number;
    top10: number;
  };
  perCategory: Array<{
    key: string;
    label: string;
    users: number;
    reviews: number;
    perUser: number;
    gini: number;
    top1: number;
    top10: number;
  }>;
  /** Lorenz curve, downsampled to ~60 points. */
  curve: Array<{ perUser: number; users: number; reviews: number }>;
  /** Mean rating at a reviewer's nth review, pooled. */
  globalIndex: Array<{ i: number; n: number; r: number }>;
  indexSlopes: Array<{ key: string; label: string; slope: number; points: number }>;
  tenure: Array<{ days: number; users: number; reviews: number }>;
  meanHist: Array<{ bin: number; users: number; reviews: number }>;
  gaps: Array<{ days: number; n: number }>;
  bursts: { head: Array<{ k: number; n: number }>; tailN: number; tailMax: number };
  variance: Array<{
    factor: string;
    from: string;
    groups: number;
    singletonPct: number;
    reviewsInSingletonPct: number;
    marginalPct: number;
  }>;
}

export interface ItemDynamics {
  pooledIndex: Array<{ i: number; n: number; r: number }>;
  perCategoryIndex: Record<string, Array<{ i: number; n: number; r: number }>>;
  indexSlopes: Array<{ key: string; label: string; slope: number; first: number | null }>;
  firstEffect: Array<{ firstRating: number; n: number; later: number }>;
  firstEffectByCategory: Array<{
    key: string;
    label: string;
    after1: number;
    after5: number;
    gap: number;
    n: number;
  }>;
  meanSd: Array<{ mean: number; sd: number; items: number }>;
  velocity: Array<{ w: number; n: number }>;
  velocityFull: Array<{ w: number; n: number }>;
  gini: Array<{ key: string; label: string; gini: number }>;
  gaps: Record<string, number>;
}

export interface Daily {
  weekly: Array<{ d: string; n: number; r: number | null }>;
  recent: Array<{ d: string; n: number; r: number | null }>;
  top: Array<{ d: string; n: number; r: number | null; cov: number | null }>;
  /** Day-of-year profile, indexed so 100 = that year's average day. */
  doy: Array<{ md: string; idx: number }>;
  coverage: {
    days: number;
    from: string;
    to: string;
    maskedCategoryDays: number;
    totalCategoryDays: number;
  };
}

export interface CrossCategory {
  breadth: Array<{ k: number; users: number; reviews: number }>;
  cooccurrence: Array<{ a: string; b: string; users: number }>;
  transitions: Array<{ a: string; b: string; n: number; share: number }>;
  labels: Record<string, string>;
}

export interface Catalogue {
  price: Array<{
    key: string;
    label: string;
    items: number;
    nullPct: number;
    deciles: Array<number | null>;
  }>;
  brands: Array<{
    key: string;
    label: string;
    brands: number;
    items: number;
    reviews: number;
    cr4Items: number;
    cr4Reviews: number;
    hhiItems: number;
    hhiReviews: number;
  }>;
  tree: Array<{
    key: string;
    label: string;
    items: number;
    avgDepth: number;
    maxDepth: number;
    emptyPct: number;
    paths: number;
  }>;
  topKeys: Array<{ key: string; items: number; cats: number }>;
  detailsCategories: number;
  boughtTogether: { categories: number; withAny: number };
}

export interface ReviewQualityData {
  helpfulAll: Array<{
    key: string;
    label: string;
    n: number;
    p50: number;
    p90: number;
    p99: number;
    p999: number;
    max: number;
    zeroPct: number;
  }>;
  helpfulByRating: Array<{ rating: number; n: number; p90: number; p99: number; zeroPct: number }>;
  lengthByRating: Array<{
    rating: number;
    n: number;
    words: number;
    p50: number;
    chars: number;
    excl: number;
    caps: number;
  }>;
  imgProfile: Array<{ hasImage: boolean; n: number; mean: number; dist: number[] }>;
  imgByCategory: Array<{ key: string; label: string; pct: number; n: number }>;
  verProfile: Array<{ verified: boolean; n: number; mean: number; dist: number[] }>;
  verByYear: Array<{
    year: number;
    verified: { n: number; mean: number; dist: number[] };
    unverified: { n: number; mean: number; dist: number[] };
  }>;
  verByCategory: Array<{ key: string; label: string; v: number; u: number; gap: number; n: number }>;
  dupByYear: Array<{ year: number; n: number; pct: number }>;
  dupByCategory: Array<{ key: string; label: string; n: number; pct: number }>;
}
