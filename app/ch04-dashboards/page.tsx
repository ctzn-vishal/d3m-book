import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch04-dashboards', Article);
export { metadata };
export default Page;
