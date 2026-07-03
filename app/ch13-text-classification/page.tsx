import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch13-text-classification', Article);
export { metadata };
export default Page;
