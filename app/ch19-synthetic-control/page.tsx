import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§12.2 Synthetic Control | ${book.title}`,
  description:
    'Synthetic control for one treated market, using Colorado housing prices and a weighted donor pool counterfactual.',
};

export default function Page() {
  return (
    <BookShell slug="ch19-synthetic-control" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
