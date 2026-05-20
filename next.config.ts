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
// Note: remark-math/rehype-katex were evaluated but conflict with prose currency
// like "$3.50" across Part 3. Inline and display math are handled by the custom
// $...$ / $$...$$ parser in mdx-components.tsx plus the <Equation> and <M>
// components, all of which render with KaTeX. See mdx-components.tsx and
// components/Book/M.tsx.
const withMDX = createMDX({
  options: {
    remarkPlugins: [['remark-gfm', {}]],
  },
});

export default withMDX(nextConfig);
