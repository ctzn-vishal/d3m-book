import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch14-goose-island-case', Article);
export { metadata };
export default Page;
