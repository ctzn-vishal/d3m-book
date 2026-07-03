import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch12-targeting', Article);
export { metadata };
export default Page;
