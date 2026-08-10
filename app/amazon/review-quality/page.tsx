import { amazonAnalysisPage } from '@/lib/amazon-page';
import { ReviewQualityReport } from '@/components/amazon/ReviewQualityReport';
import type { ReviewQualityData } from '@/components/amazon/phase2-types';
import raw from '../data/phase2-review-quality.json';

const { metadata, Page } = amazonAnalysisPage<ReviewQualityData>({
  slug: 'review-quality',
  Report: ReviewQualityReport,
  data: raw as unknown as ReviewQualityData,
  standfirst:
    'Helpful votes, length, photos, and duplicate text — plus the verified-purchase joint, which reverses the sign of the correlation the overview page reports at category level.',
  description:
    'The anatomy of an Amazon review: helpful-vote skew, the inverted-U of length against rating, photo share, duplicate text, and the verified-purchase Simpson’s paradox.',
});

export { metadata };
export default Page;
