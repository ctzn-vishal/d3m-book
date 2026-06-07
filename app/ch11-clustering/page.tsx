import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§11.1 Clustering for Segmentation | ${book.title}`,
  description:
    'No labels, only similarity — turning a customer feature space into named segments managers can act on.',
};

export default function Page() {
  return (
    <BookShell slug="ch11-clustering" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
