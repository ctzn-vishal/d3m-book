import { amazonAnalysisPage } from '@/lib/amazon-page';
import { ItemDynamicsReport } from '@/components/amazon/ItemDynamicsReport';
import type { ItemDynamics } from '@/components/amazon/phase2-types';
import raw from '../data/phase2-item-dynamics.json';

const { metadata, Page } = amazonAnalysisPage<ItemDynamics>({
  slug: 'item-dynamics',
  Report: ItemDynamicsReport,
  data: raw as unknown as ItemDynamics,
  standfirst:
    'If later reviewers copied earlier ones, it would show up as drift in a product’s rating as reviews accumulate. It does not. But what the very first review said predicts the next hundred.',
  description:
    'How Amazon product ratings accumulate: rating by review index, the first-review effect across 33 categories, contested versus merely mediocre products, and the review velocity curve.',
});

export { metadata };
export default Page;
