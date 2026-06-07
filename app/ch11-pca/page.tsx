import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§11.2 PCA, Factor Analysis, and Perceptual Maps | ${book.title}`,
  description:
    'Compressing many correlated variables into a few interpretable dimensions — and what brand managers do with the result.',
};

export default function Page() {
  return (
    <BookShell slug="ch11-pca" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
