import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch09-feature-engineering', Article);
export { metadata };
export default Page;
