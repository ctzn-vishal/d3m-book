import { amazonAnalysisPage } from '@/lib/amazon-page';
import { CrossCategoryReport } from '@/components/amazon/CrossCategoryReport';
import type { CrossCategory } from '@/components/amazon/phase2-types';
import raw from '../data/phase2-cross-category.json';

const { metadata, Page } = amazonAnalysisPage<CrossCategory>({
  slug: 'cross-category',
  Report: CrossCategoryReport,
  data: raw as unknown as CrossCategory,
  standfirst:
    'Following reviewers across categories is the only thing this corpus can say about adjacency and substitution — and it needed the reviewer-level shuffle to say it at all.',
  description:
    'Cross-category Amazon reviewer behaviour: how many categories a reviewer touches, the 33x33 co-occurrence matrix, and the probability the next review stays put.',
});

export { metadata };
export default Page;
