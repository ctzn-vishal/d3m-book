import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§9 Exploratory Visualization and Dashboards | ${book.title}`,
  description:
    'A dashboard is not a collection of charts. It is a sequence of business questions. Every panel should answer one question and lead to the next.',
};

export default function Page() {
  return (
    <BookShell slug="ch03-exploratory-viz" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
