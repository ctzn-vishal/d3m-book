import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    // Gallery article thumbnails are served from the Tigris `vishal` bucket
    // (and content.vishalsingh.org once the domain is bound).
    remotePatterns: [
      { protocol: 'https', hostname: 'vishal.t3.tigrisfiles.io' },
      { protocol: 'https', hostname: 'content.vishalsingh.org' },
    ],
  },
  // Consolidation pass (Medium): every article moved to a gapless, suffix-free
  // chNN-keyword slug. Each old path 301s to its new home so inbound/indexed
  // links survive. The two pre-consolidation redirects are chained forward to
  // the new slugs of the chapters that absorbed them (ch46 -> ch14-embeddings;
  // ch50 -> ch16-llm-capabilities).
  async redirects() {
    return [
      { source: '/ch00-0-foreword', destination: '/ch00-foreword', permanent: true },
      { source: '/ch00-1-what-is-d3m', destination: '/ch00-data-origins', permanent: true },
      { source: '/ch00-2-evidence-stack', destination: '/ch00-data-storage', permanent: true },
      { source: '/ch00-3-how-data-is-used', destination: '/ch00-data-uses', permanent: true },
      { source: '/ch00-4-data-to-decision-loop', destination: '/ch00-decision-loop', permanent: true },
      { source: '/ch01-what-is-a-dataset', destination: '/ch01-dataset', permanent: true },
      { source: '/ch02-data-structures', destination: '/ch01-data-structures', permanent: true },
      { source: '/ch03-variable-types', destination: '/ch01-variable-types', permanent: true },
      { source: '/ch04-sql-like-excel', destination: '/ch02-sql', permanent: true },
      { source: '/ch05-joining-data', destination: '/ch02-joins', permanent: true },
      { source: '/ch06-reshaping-data', destination: '/ch02-reshaping', permanent: true },
      { source: '/ch07-transformations-and-metrics', destination: '/ch02-metrics', permanent: true },
      { source: '/ch08-data-quality', destination: '/ch02-data-quality', permanent: true },
      { source: '/data-language-studio', destination: '/ch02-studio-data-language', permanent: true },
      { source: '/ch09-exploratory-viz', destination: '/ch03-exploratory-viz', permanent: true },
      { source: '/chart-atlas', destination: '/ch03-chart-atlas', permanent: true },
      { source: '/market-concentration-metrics-case', destination: '/ch03-concentration-case', permanent: true },
      { source: '/visual-comparison-baselines', destination: '/ch04-baselines', permanent: true },
      { source: '/small-multiples-for-heterogeneity', destination: '/ch04-small-multiples', permanent: true },
      { source: '/uncertainty-for-managers', destination: '/ch04-uncertainty', permanent: true },
      { source: '/statistical-charts-before-statistics', destination: '/ch04-statistical-charts', permanent: true },
      { source: '/dashboard-decision-systems', destination: '/ch04-dashboards', permanent: true },
      { source: '/ch10-capstone-growth-diagnostic', destination: '/ch04-studio-visual-brief', permanent: true },
      { source: '/ch11-from-metrics-to-decisions', destination: '/ch05-metrics-to-decisions', permanent: true },
      { source: '/ch12-causality-counterfactual', destination: '/ch05-counterfactual', permanent: true },
      { source: '/ch13-experiments-ab-testing', destination: '/ch05-experiments', permanent: true },
      { source: '/ch14-why-historical-data-is-hard', destination: '/ch05-historical-data', permanent: true },
      { source: '/ch15-regression-effect-isolation', destination: '/ch06-regression', permanent: true },
      { source: '/ch16-identification', destination: '/ch06-identification', permanent: true },
      { source: '/ch17-panel-fixed-effects', destination: '/ch06-fixed-effects', permanent: true },
      { source: '/ch18-difference-in-differences', destination: '/ch07-did', permanent: true },
      { source: '/ch19-synthetic-control', destination: '/ch07-synthetic-control', permanent: true },
      { source: '/ch20-heterogeneous-effects', destination: '/ch07-heterogeneous-effects', permanent: true },
      { source: '/ch21-price-elasticity', destination: '/ch08-price-elasticity', permanent: true },
      { source: '/ch22-cross-price-elasticity', destination: '/ch08-cross-price-elasticity', permanent: true },
      { source: '/ch23-elasticity-to-pricing', destination: '/ch08-pricing-decisions', permanent: true },
      { source: '/ch24-capstone-pricing-promotion', destination: '/ch08-studio-pricing', permanent: true },
      { source: '/ch25-rules-to-algorithms', destination: '/ch09-rules-to-algorithms', permanent: true },
      { source: '/ch26-supervised-setup', destination: '/ch09-supervised-setup', permanent: true },
      { source: '/ch27-train-test-generalization', destination: '/ch09-generalization', permanent: true },
      { source: '/ch28-feature-engineering', destination: '/ch09-feature-engineering', permanent: true },
      { source: '/ch29-logistic-churn', destination: '/ch10-logistic-churn', permanent: true },
      { source: '/ch30-classification-evaluation', destination: '/ch10-classification-eval', permanent: true },
      { source: '/ch31-numeric-prediction', destination: '/ch10-numeric-prediction', permanent: true },
      { source: '/ch32-trees-ensembles', destination: '/ch10-trees-ensembles', permanent: true },
      { source: '/ch33-automl-explainability', destination: '/ch10-automl-explainability', permanent: true },
      { source: '/renthop-hot-listings-case', destination: '/ch10-renthop-case', permanent: true },
      { source: '/ch36-unsupervised-segmentation', destination: '/ch11-clustering', permanent: true },
      { source: '/ch37-pca-perceptual-maps', destination: '/ch11-pca', permanent: true },
      { source: '/ch37b-tsne-umap', destination: '/ch11-tsne-umap', permanent: true },
      { source: '/lottery-zip-psychographics-case', destination: '/ch11-lottery-case', permanent: true },
      { source: '/ch38-targeting-lookalikes', destination: '/ch12-targeting', permanent: true },
      { source: '/ch39-recommenders-ranking', destination: '/ch12-recommenders', permanent: true },
      { source: '/ch40-deployment-monitoring', destination: '/ch12-deployment-monitoring', permanent: true },
      { source: '/ch41-capstone-customer-intelligence', destination: '/ch12-studio-customer-intel', permanent: true },
      { source: '/ch42a-structured-to-unstructured', destination: '/ch13-structured-to-unstructured', permanent: true },
      { source: '/ch42b-text-as-data', destination: '/ch13-text-as-data', permanent: true },
      { source: '/ch42-preprocessing-tfidf', destination: '/ch13-preprocessing-tfidf', permanent: true },
      { source: '/ch43-text-classification', destination: '/ch13-text-classification', permanent: true },
      { source: '/ch44-topic-models', destination: '/ch13-topic-models', permanent: true },
      { source: '/ch45-limits-of-classical-nlp', destination: '/ch13-classical-nlp-limits', permanent: true },
      { source: '/trump-tweet-device-case', destination: '/ch14-trump-case', permanent: true },
      { source: '/goose-island-acquisition-sentiment-case', destination: '/ch14-goose-island-case', permanent: true },
      { source: '/ch46-embeddings', destination: '/ch14-embeddings', permanent: true },
      { source: '/ch47b-gpt-measurement', destination: '/ch14-gpt-measurement', permanent: true },
      { source: '/ch48-rag', destination: '/ch15-rag', permanent: true },
      { source: '/ch49-vision-fundamentals', destination: '/ch15-vision', permanent: true },
      { source: '/ch49b-ocr-document-ai', destination: '/ch15-ocr-document-ai', permanent: true },
      { source: '/ch49c-multimodal-ai', destination: '/ch15-multimodal', permanent: true },
      { source: '/ch50-llms-capabilities', destination: '/ch16-llm-capabilities', permanent: true },
      { source: '/ch50c-structured-outputs', destination: '/ch16-structured-outputs', permanent: true },
      { source: '/ch51-agents-tools', destination: '/ch16-agents-tools', permanent: true },
      { source: '/ch52-ai-governance', destination: '/ch16-ai-governance', permanent: true },
      { source: '/ch53-capstone-customer-voice', destination: '/ch16-studio-customer-voice', permanent: true },
      { source: '/ch54-data-product-view', destination: '/ch17-data-product', permanent: true },
      { source: '/ch55-decision-memos', destination: '/ch17-decision-memos', permanent: true },
      { source: '/ch56-monitoring-feedback', destination: '/ch17-learning-loops', permanent: true },
      { source: '/ch57-final-integrative-case', destination: '/ch17-studio-final-case', permanent: true },
      // legacy (pre-consolidation) merges, chained forward:
      { source: '/ch47-semantic-search', destination: '/ch14-embeddings', permanent: true },
      { source: '/ch50b-prompting', destination: '/ch16-llm-capabilities', permanent: true },

      // legacy studio slugs from the first politics batch → the renamed studio's HTML:
      {
        source: '/studios/negative-partisanship-anes',
        destination: '/studios/out-party-hate-not-in-party-love/index.html',
        permanent: true,
      },
      {
        source: '/studios/unsorted-voters-switched',
        destination: '/studios/sorting-was-conversion-not-replacement/index.html',
        permanent: true,
      },
      {
        source: '/studios/partisans-finally-got-constraint',
        destination: '/studios/partisans-got-constraint/index.html',
        permanent: true,
      },

      // Studios viewer retired (2026-06): the gallery (/) lists every studio, and
      // each studio is a self-contained HTML file in public/studios/<slug>/. Send
      // the old pretty paths to the gallery / the raw file. Order matters — the
      // three specific legacy slugs above resolve before this catch-all.
      { source: '/studios', destination: '/', permanent: true },
      { source: '/studios/:slug', destination: '/studios/:slug/index.html', permanent: true },
    ];
  },

  // ── Tier C proxy spokes (hub rewrites) ──────────────────────────────────
  // Each externally-deployed app/data-story is registered in lib/gallery.ts and
  // currently opens at its live *.vercel.app URL (new tab). To bring it UNDER
  // vishalsingh.org at the hub path below, uncomment its rule — but ONLY after
  // its origin is retrofitted, or /_next assets will 404 through the proxy:
  //   • Next origins → set `basePath` (+ `assetPrefix`) to the mount path in
  //                    THEIR OWN next.config (e.g. basePath: '/atlas/trade').
  //   • scrc-data    → Vite SPA: rebuild with `base: '/apps/scrc/'` (no basePath knob).
  // Keep the hub pinned to a current Next 16.2.x patch — this proxy path is the
  // surface the rewrite/middleware advisories touched.
  async rewrites() {
    return [
      // { source: '/atlas/well-being/:path*', destination: 'https://well-being-atlas.vercel.app/atlas/well-being/:path*' },
      // { source: '/atlas/trade/:path*',      destination: 'https://world-trade-atlas.vercel.app/atlas/trade/:path*' },
      // { source: '/apps/zip-health/:path*',  destination: 'https://health-of-americas-zip-codes.vercel.app/apps/zip-health/:path*' },
      // { source: '/apps/ai-models/:path*',   destination: 'https://v0-interactive-table-lac.vercel.app/apps/ai-models/:path*' },
      // { source: '/apps/scrc/:path*',        destination: 'https://scrc-data.vercel.app/apps/scrc/:path*' },
    ];
  },
};

// remark-gfm enables GitHub-flavored markdown extensions: pipe tables,
// task lists, strikethrough, autolinks. Required for the comparison tables
// across Part 3.
//
// rehype-slug stamps a stable `id` on every heading so the in-page
// "On this page" rail (components/Book/OnThisPage.tsx) can scroll-spy and
// deep-link to sections. Passed in string form (not an imported function)
// so Turbopack can serialize the loader options — see Next 16 MDX + Turbopack.
//
// Note: remark-math/rehype-katex were evaluated but conflict with prose currency
// like "$3.50" across Part 3. Inline and display math are handled by the custom
// $...$ / $$...$$ parser in mdx-components.tsx plus the <Equation> and <M>
// components, all of which render with KaTeX. See mdx-components.tsx and
// components/Book/M.tsx.
const withMDX = createMDX({
  options: {
    remarkPlugins: [['remark-gfm', {}]],
    rehypePlugins: [['rehype-slug', {}]],
  },
});

export default withMDX(nextConfig);
