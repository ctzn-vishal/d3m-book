import { amazonAnalysisPage } from '@/lib/amazon-page';
import { DailyReport } from '@/components/amazon/DailyReport';
import type { Daily } from '@/components/amazon/phase2-types';
import raw from '../data/phase2-daily.json';

const { metadata, Page } = amazonAnalysisPage<Daily>({
  slug: 'daily',
  Report: DailyReport,
  data: raw as unknown as Daily,
  standfirst:
    'Phase 1 had yearly totals and pooled cyclical profiles, but no date axis — so no question about a specific day could be asked. The biggest review days in Amazon’s history turn out to be in January.',
  description:
    'The full daily Amazon review series, 1996–2023: weekly volume over 28 years, the highest-volume days, and the day-by-day annual cycle with the growth trend removed.',
});

export { metadata };
export default Page;
