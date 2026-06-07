import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§0.2 How Data Is Stored | ${book.title}`,
  description:
    'A practical map of operational databases, analytical warehouses, data lakes, DuckDB-style local analytics, search, graph, and vector systems.',
};

export default function Page() {
  return (
    <BookShell slug="ch00-data-storage" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
