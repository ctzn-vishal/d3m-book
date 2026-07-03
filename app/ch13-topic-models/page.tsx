import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch13-topic-models', Article);
export { metadata };
export default Page;
