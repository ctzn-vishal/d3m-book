import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Merged chapters: old routes 308-redirect to the article that absorbed them
  // (ch47 → ch46 in §19; ch50b → ch50 in §21). Keeps inbound links alive.
  async redirects() {
    return [
      { source: '/ch47-semantic-search', destination: '/ch46-embeddings', permanent: true },
      { source: '/ch50b-prompting', destination: '/ch50-llms-capabilities', permanent: true },
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
