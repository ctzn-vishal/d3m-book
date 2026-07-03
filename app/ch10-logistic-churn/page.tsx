import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch10-logistic-churn', Article);
export { metadata };
export default Page;
