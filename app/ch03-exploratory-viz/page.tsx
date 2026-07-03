import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch03-exploratory-viz', Article);
export { metadata };
export default Page;
