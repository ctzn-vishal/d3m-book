import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch09-supervised-setup', Article);
export { metadata };
export default Page;
