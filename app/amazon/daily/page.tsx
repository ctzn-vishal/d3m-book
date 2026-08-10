import { amazonAnalysisPage } from '@/lib/amazon-page';
import { DailyReport } from '@/components/amazon/DailyReport';
import type { Daily } from '@/components/amazon/phase2-types';
import raw from '../data/phase2-daily.json';

const { metadata, Page } = amazonAnalysisPage<Daily>({
  slug: 'daily',
  Report: DailyReport,
  data: raw as unknown as Daily,
  standfirst:
    'Yearly totals and pooled monthly profiles cannot answer a question about a specific day. With a date axis, the biggest review days in Amazon’s history turn out to be in January — not Prime Day, not Black Friday.',
  description:
    'The full daily Amazon review series, 1996–2023: weekly volume over 28 years, the highest-volume days, and the day-by-day annual cycle with the growth trend removed.',
});

export { metadata };
export default Page;
