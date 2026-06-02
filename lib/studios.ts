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
