import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch10-classification-eval', Article);
export { metadata };
export default Page;
