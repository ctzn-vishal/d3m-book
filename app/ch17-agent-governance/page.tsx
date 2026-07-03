import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch17-agent-governance', Article);
export { metadata };
export default Page;
