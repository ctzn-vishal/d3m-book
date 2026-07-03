import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch04-small-multiples', Article);
export { metadata };
export default Page;
