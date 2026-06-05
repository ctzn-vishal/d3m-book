import { findArticle } from '@/lib/book-toc';

export type StudioKind = 'dashboard' | 'exercise';

export type Studio = {
  /** URL slug → /studios/<slug> and public/studios/<slug>/index.html */
  slug: string;
  title: string;
  /** One-sentence hook shown on the gallery card. */
  blurb: string;
  /** Short domain tag, e.g. "Airlines", "Pricing". */
  domain: string;
  /** Skills/methods the studio exercises — rendered as chips. */
  methods: string[];
  /** Slug of the chapter this studio pairs with (cross-link both ways). */
  relatedSlug: string;
  /** "dashboard" = explore a live view; "exercise" = hands-on, do it yourself. */
  kind: StudioKind;
  /** Accent hex for the card's top rule. Kept within the brand-adjacent palette. */
  accent: string;
};

/**
 * Registry of interactive case studios. Each entry is a self-contained static
 * HTML file living in public/studios/<slug>/index.html, framed by the
 * /studios/[slug] viewer and surfaced as a card in the /studios gallery.
 *
 * These are NOT MDX articles — they are standalone D3/Recharts dashboards and
 * exercises. The book cross-links to the relevant one from each paired chapter.
 */
export const studios: Studio[] = [
  {
    slug: 'gdelt-media-agenda-lab',
    title: 'GDELT Media Agenda Lab',
    blurb:
      'Search global news and television coverage as an agenda-setting lab: compare attention, tone, source geography, station airtime, and evidence cards from live GDELT APIs.',
    domain: 'Global Media',
    methods: ['Live API', 'Tone analysis', 'Media agenda'],
    relatedSlug: 'ch42b-text-as-data',
    kind: 'dashboard',
    accent: '#187C78',
  },
  {
    slug: 'cfpb-crisis-monitor',
    title: 'CFPB Crisis Monitor',
    blurb:
      'Use public consumer complaints as a crisis early-warning system: pin incident spikes, inspect consented narratives, and separate product mix shifts from real operational improvement.',
    domain: 'Consumer Finance',
    methods: ['Text as data', 'Spike detection', 'Structural shift'],
    relatedSlug: 'ch42b-text-as-data',
    kind: 'dashboard',
    accent: '#28527A',
  },
  {
    slug: 'presidential-election-atlas',
    title: 'Presidential Election Atlas: 1976-2024',
    blurb:
      'A state-by-state presidential election dashboard: move across 1976-2024, compare national outcomes, read the hex map, and inspect which states shifted most from the prior election.',
    domain: 'Politics',
    methods: ['Dashboard sequencing', 'Geospatial comparison', 'State shifts'],
    relatedSlug: 'ch09-exploratory-viz',
    kind: 'dashboard',
    accent: '#287D67',
  },
  {
    slug: 'ad-spend-explorer',
    title: 'Industry Ad Spend Explorer',
    blurb:
      'Explore 2018-2022 advertising spend by industry group, advertiser, and media type, with a Covid-era lens on budget shocks, recovery, and media mix shifts.',
    domain: 'Advertising',
    methods: ['Dashboard sequencing', 'Media mix', 'Shock analysis'],
    relatedSlug: 'market-concentration-metrics-case',
    kind: 'dashboard',
    accent: '#2F8F7B',
  },
  {
    slug: 'nyc-taxi-covid-emergency',
    title: 'NYC Taxi/Ride-Hail: Uber & Lyft at the COVID Emergency',
    blurb:
      'Trace Uber and Lyft rides across NYC pickup zones as demand breaks around the March 2020 emergency declaration, then compare the late-April floor by borough and zone.',
    domain: 'Mobility',
    methods: ['Shock analysis', 'Time series', 'Spatial ranking'],
    relatedSlug: 'dashboard-decision-systems',
    kind: 'dashboard',
    accent: '#2563A6',
  },
  {
    slug: 'nyc-airbnb-atlas',
    title: 'NYC Airbnb: A Listings Atlas',
    blurb:
      'Explore tens of thousands of NYC listings by neighborhood, room type, and price — a worked example of how exploratory views turn a raw marketplace dump into a map of where supply and money actually sit.',
    domain: 'Marketplaces',
    methods: ['Exploratory viz', 'Geospatial mapping', 'Distributions'],
    relatedSlug: 'ch09-exploratory-viz',
    kind: 'dashboard',
    accent: '#0EA5E9',
  },
  {
    slug: 'progresso-dashboard',
    title: 'Countercyclical Pricing: Progresso Soup',
    blurb:
      'When demand is seasonal and a recession hits, when should a soup brand cut price and when should it hold? Trace promotion, volume, and competitive response across the cycle.',
    domain: 'CPG & Pricing',
    methods: ['Pricing strategy', 'Demand seasonality', 'Time series'],
    relatedSlug: 'ch24-capstone-pricing-promotion',
    kind: 'dashboard',
    accent: '#F97316',
  },
  {
    slug: 'southwest-regression',
    title: 'The Southwest Effect',
    blurb:
      'Does a low-cost carrier entering a route really pull fares down — and by how much, once you hold distance and demand fixed? A visual walk through the classic regression.',
    domain: 'Airlines',
    methods: ['Regression', 'Effect isolation', 'Controls'],
    relatedSlug: 'ch15-regression-effect-isolation',
    kind: 'dashboard',
    accent: '#10B981',
  },
  {
    slug: 'southwest-regression-exercise',
    title: 'Regression Exercise: Did Southwest Lower Airfares?',
    blurb:
      'The hands-on companion: download the route data, run the regression yourself, and read the coefficients the way a manager would. Built for a live class session.',
    domain: 'Airlines',
    methods: ['Hands-on regression', 'Coefficient reading', 'Data download'],
    relatedSlug: 'ch15-regression-effect-isolation',
    kind: 'exercise',
    accent: '#8B5CF6',
  },
  {
    slug: 'share-of-wallet',
    title: 'Fast-Food Share of Wallet: COVID Impact',
    blurb:
      'How did the pandemic redraw where consumers spent their fast-food dollars? A share-of-wallet dashboard that benchmarks chains against the category through the shock and recovery.',
    domain: 'Restaurants',
    methods: ['Share of wallet', 'Benchmarking', 'Shock analysis'],
    relatedSlug: 'dashboard-decision-systems',
    kind: 'dashboard',
    accent: '#F43F5E',
  },
  {
    slug: 'fast-food-perceptual-map',
    title: 'Fast-Food Brand Perceptual Map',
    blurb:
      'Reduce 48 BAV brand attributes into factor-map axes, inspect loadings, cluster fast-food brands, and test how much Brand Asset follows from the latent perception scores.',
    domain: 'Restaurants',
    methods: ['PCA', 'Factor analysis', 'Brand clustering'],
    relatedSlug: 'ch37-pca-perceptual-maps',
    kind: 'dashboard',
    accent: '#2A9D8F',
  },
  {
    slug: 'nyc-zip-health-segments',
    title: 'NYC Metro ZIP Health Segments',
    blurb:
      'Use health prevalence measures to build factor scores, cluster ZIP codes, and interpret the segments by correlating scores with income, age, college share, and deprivation.',
    domain: 'Public Health',
    methods: ['Factor scores', 'K-means clustering', 'Segment profiling'],
    relatedSlug: 'ch36-unsupervised-segmentation',
    kind: 'dashboard',
    accent: '#4E79A7',
  },
  {
    slug: 'lottery-zip-psychographics',
    title: 'Lottery ZIP Psychographics: How Neighborhoods Play',
    blurb:
      'Segment active NYC ZIP codes from NY Lottery behavior signals, then interpret the PCA/factor score space with borough, income, retailer availability, and product-mix profiles.',
    domain: 'Public Finance',
    methods: ['PCA', 'Factor analysis', 'K-means clustering'],
    relatedSlug: 'ch36-unsupervised-segmentation',
    kind: 'dashboard',
    accent: '#C85B47',
  },
];

export function findStudio(slug: string): Studio | null {
  return studios.find(s => s.slug === slug) ?? null;
}

export function getStudioSlugs(): string[] {
  return studios.map(s => s.slug);
}

/**
 * Resolve a studio's paired chapter into display fields for cross-linking.
 * Returns null if the related slug is missing or unpublished, so callers can
 * gracefully omit the link rather than render a dead reference.
 */
export function relatedChapter(studio: Studio): { slug: string; number: string; title: string } | null {
  const found = findArticle(studio.relatedSlug);
  if (!found || found.article.status !== 'published') return null;
  return {
    slug: found.article.slug,
    number: found.article.number,
    title: found.article.title,
  };
}
