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
    'Summarise reviews by category and the reviewer disappears. Group them by author instead, and the star scale turns out to measure two things at once — the smaller of which is the product.',
  description:
    'Who writes Amazon reviews: the activity gradient in ratings, reviewer concentration (Gini 0.64), tenure, and why the marginal variance shares are not a decomposition.',
});

export { metadata };
export default Page;
