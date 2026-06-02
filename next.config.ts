import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
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
