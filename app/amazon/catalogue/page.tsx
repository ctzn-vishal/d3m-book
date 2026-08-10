import { amazonAnalysisPage } from '@/lib/amazon-page';
import { CatalogueReport } from '@/components/amazon/CatalogueReport';
import type { Catalogue } from '@/components/amazon/phase2-types';
import raw from '../data/phase2-catalogue.json';

const { metadata, Page } = amazonAnalysisPage<Catalogue>({
  slug: 'catalogue',
  Report: CatalogueReport,
  data: raw as unknown as Catalogue,
  standfirst:
    'Prices, brand concentration, and the attribute vocabulary of 35 million products — and the three measures this corpus is structurally unable to answer.',
  description:
    'The item side of the Amazon corpus: price missingness and deciles, brand HHI by items versus reviews, product-detail key vocabulary, and three documented negative results.',
});

export { metadata };
export default Page;
