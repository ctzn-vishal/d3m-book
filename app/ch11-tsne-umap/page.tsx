import { chapterPage } from '@/lib/chapter-page';
import Article from './article.mdx';

const { metadata, Page } = chapterPage('ch11-tsne-umap', Article);
export { metadata };
export default Page;
