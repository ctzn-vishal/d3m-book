import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch10-renthop-case', Article);
export { metadata };
export default Page;
