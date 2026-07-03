import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch11-lottery-case', Article);
export { metadata };
export default Page;
