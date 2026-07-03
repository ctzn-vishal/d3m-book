import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch02-studio-data-language', Article);
export { metadata };
export default Page;
