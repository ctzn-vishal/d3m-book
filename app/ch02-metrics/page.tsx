import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch02-metrics', Article);
export { metadata };
export default Page;
