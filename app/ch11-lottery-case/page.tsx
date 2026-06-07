import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import { createPreviewMetadata } from '@/lib/share-metadata';
import Article from './article.mdx';

const title = `§11.4 Case Study: Lottery ZIP Psychographics | ${book.title}`;
const description =
  'A rigorous non-causal case study using NY Lottery ZIP-level behavior to explore PCA, clustering, group-by heterogeneity, and demographic interactions.';

export const metadata: Metadata = {
  title,
  description,
  ...createPreviewMetadata({
    title,
    description,
    type: 'article',
    imagePath: '/lottery-zip-psychographics-case/opengraph-image',
    imageAlt: 'Lottery ZIP Psychographics case study preview card',
  }),
};

export default function Page() {
  return (
    <BookShell slug="ch11-lottery-case" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
