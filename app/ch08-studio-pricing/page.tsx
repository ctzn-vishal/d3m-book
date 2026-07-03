import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch08-studio-pricing', Article);
export { metadata };
export default Page;
