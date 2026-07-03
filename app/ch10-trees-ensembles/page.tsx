import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch10-trees-ensembles', Article);
export { metadata };
export default Page;
