import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch16-llm-capabilities', Article);
export { metadata };
export default Page;
