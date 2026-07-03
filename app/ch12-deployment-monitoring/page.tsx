import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch12-deployment-monitoring', Article);
export { metadata };
export default Page;
