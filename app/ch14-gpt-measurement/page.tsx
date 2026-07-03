import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch14-gpt-measurement', Article);
export { metadata };
export default Page;
