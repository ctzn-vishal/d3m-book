import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch01-reading-data', Article);
export { metadata };
export default Page;
