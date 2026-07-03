import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch05-historical-data', Article);
export { metadata };
export default Page;
