import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch13-text-as-data', Article);
export { metadata };
export default Page;
