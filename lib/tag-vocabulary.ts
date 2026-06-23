/**
 * Controlled vocabulary for gallery item tags.
 *
 * Tags add a finer, CONSISTENT layer beneath the two primary facets:
 *   - `type`  (artifact class: Teaching / Blog / App / Dataset)
 *   - `topic` (subject: Politics, Public Health, Finance … — see lib/taxonomy.ts)
 *
 * So tags should NOT repeat the subject. They describe HOW a piece works
 * (method), WHAT visual form it takes (chart), and WHAT kind of data it uses.
 * Drawn from this fixed list so the tag layer stays consistent (no
 * `Maps`/`maps` dupes, no generic "data story") and can later power a tag
 * filter. Aim for ~3–6 tags per item spanning facets — typically 1–2 method,
 * 1–2 chart, 1–2 data.
 */

export type TagFacet = 'method' | 'chart' | 'data';

export interface TagDef {
  tag: string;
  facet: TagFacet;
  desc: string;
}

export const TAG_VOCABULARY: TagDef[] = [
  // ── Method / analysis (how it was analyzed) ────────────────────────
  { tag: 'Regression', facet: 'method', desc: 'Linear/logistic regression or modeled relationships between variables.' },
  { tag: 'Causal inference', facet: 'method', desc: 'Diff-in-diff, event study, natural experiment, or explicit counterfactual reasoning.' },
  { tag: 'Forecasting', facet: 'method', desc: 'Projecting future values or extrapolating a trend.' },
  { tag: 'Clustering', facet: 'method', desc: 'Grouping units into segments (k-means, hierarchical, latent classes).' },
  { tag: 'Dimensionality reduction', facet: 'method', desc: 'PCA, factor analysis, t-SNE/UMAP, or embeddings.' },
  { tag: 'Classification', facet: 'method', desc: 'Predicting a categorical label or membership.' },
  { tag: 'Text analysis', facet: 'method', desc: 'NLP, topic models, sentiment, or text-as-data.' },
  { tag: 'Segmentation', facet: 'method', desc: 'Dividing a population into meaningful groups by behavior or traits.' },
  { tag: 'Correlation', facet: 'method', desc: 'Bivariate association / co-movement between two measures.' },
  { tag: 'Index construction', facet: 'method', desc: 'Composite indices, scores, or rankings built from multiple inputs.' },
  { tag: 'Geospatial analysis', facet: 'method', desc: 'Spatial joins, area interpolation, neighborhood/region comparison.' },
  { tag: 'Shock analysis', facet: 'method', desc: 'Before/after an event, policy change, or disruption.' },
  { tag: 'Trend analysis', facet: 'method', desc: 'Change over time — growth/decline, turning points, convergence.' },
  { tag: 'Benchmarking', facet: 'method', desc: 'Comparison against a baseline, index, model, or peer set.' },
  { tag: 'Survey analysis', facet: 'method', desc: 'Weighted estimates or cross-tabs from survey microdata.' },
  { tag: 'Inequality analysis', facet: 'method', desc: 'Gaps, spreads, concentration, or distributional disparity.' },
  { tag: 'Decomposition', facet: 'method', desc: 'Shift-share or variance decomposition — splitting a change or gap into contributing parts.' },

  // ── Chart / format (what visual form) ──────────────────────────────
  { tag: 'Choropleth', facet: 'chart', desc: 'Shaded geographic map (states / counties / tracts).' },
  { tag: 'Map', facet: 'chart', desc: 'Point, flow, or symbol map (non-choropleth).' },
  { tag: 'Time series', facet: 'chart', desc: 'Lines or areas over time.' },
  { tag: 'Small multiples', facet: 'chart', desc: 'Repeated mini-charts faceted across categories.' },
  { tag: 'Scatter plot', facet: 'chart', desc: 'Two-variable point cloud, often with a fit line.' },
  { tag: 'Distribution', facet: 'chart', desc: 'Histogram, density, box/violin, or ECDF.' },
  { tag: 'Ranking', facet: 'chart', desc: 'Bar, lollipop, or ranked-list comparison.' },
  { tag: 'Slopegraph', facet: 'chart', desc: 'Two-point before/after connected lines.' },
  { tag: 'Heatmap', facet: 'chart', desc: 'Matrix of color-encoded values.' },
  { tag: 'Network', facet: 'chart', desc: 'Nodes-and-edges relationship graph.' },
  { tag: 'Dashboard', facet: 'chart', desc: 'Multi-panel linked views with interactive controls.' },
  { tag: 'Scrollytelling', facet: 'chart', desc: 'Scroll-driven animated narrative.' },

  // ── Data / source (what kind of data) ──────────────────────────────
  { tag: 'Survey data', facet: 'data', desc: 'Gallup, ANES, GSS, Cooperative Election Study, polls.' },
  { tag: 'Census / ACS', facet: 'data', desc: 'Census Bureau or American Community Survey.' },
  { tag: 'Election returns', facet: 'data', desc: 'Vote counts by geography and cycle.' },
  { tag: 'Panel data', facet: 'data', desc: 'Repeated observations of units over time (state/county/ZIP panels).' },
  { tag: 'Scanner / CPG', facet: 'data', desc: 'Retail scanner, purchase, or product-level data.' },
  { tag: 'Prices', facet: 'data', desc: 'Price, cost, or inflation series.' },
  { tag: 'Administrative data', facet: 'data', desc: 'Government/registry records (vital statistics, filings, CDC).' },
  { tag: 'Health / mortality data', facet: 'data', desc: 'Life expectancy, mortality, disease, or other health-outcome data (USALEEP, CDC, PLACES).' },
  { tag: 'Geographic data', facet: 'data', desc: 'Tract/ZIP/county shapes or GIS layers.' },
  { tag: 'Financial data', facet: 'data', desc: 'Markets, returns, income, or firm financials.' },
];

export const TAGS_BY_FACET: Record<TagFacet, string[]> = {
  method: TAG_VOCABULARY.filter(t => t.facet === 'method').map(t => t.tag),
  chart: TAG_VOCABULARY.filter(t => t.facet === 'chart').map(t => t.tag),
  data: TAG_VOCABULARY.filter(t => t.facet === 'data').map(t => t.tag),
};

/** Fast membership check used when validating agent-proposed tags. */
export const TAG_SET = new Set(TAG_VOCABULARY.map(t => t.tag));

export function isCanonicalTag(tag: string): boolean {
  return TAG_SET.has(tag);
}
