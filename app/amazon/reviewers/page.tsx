import { amazonAnalysisPage } from '@/lib/amazon-page';
import { ReviewersReport } from '@/components/amazon/ReviewersReport';
import type { Phase2Meta, Reviewers } from '@/components/amazon/phase2-types';
import reviewersRaw from '../data/phase2-reviewers.json';
import metaRaw from '../data/phase2-meta.json';

const data = reviewersRaw as unknown as Reviewers;
const meta = metaRaw as unknown as Phase2Meta;

const { metadata, Page } = amazonAnalysisPage<Reviewers>({
  slug: 'reviewers',
  // The variance caveat comes from the published manifest rather than being
  // restated here, so the page cannot drift from what the pipeline says.
  Report: ({ data: d }) => <ReviewersReport data={d} meta={meta} />,
  data,
  standfirst:
    'Phase 1 never grouped a single review by its author. Doing so turns the star scale into a measurement of two things at once — and the smaller of the two is the product.',
  description:
    'Who writes Amazon reviews: the activity gradient in ratings, reviewer concentration (Gini 0.64), tenure, and why the marginal variance shares are not a decomposition.',
});

export { metadata };
export default Page;
