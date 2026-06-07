import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§2 Data Structures | ${book.title}`,
  description:
    'Cross-sectional, time-series, panel, geo, network: the shape of the data determines the questions you can answer. The same Bean & Basket business looks different through each lens.',
};

export default function Page() {
  return (
    <BookShell slug="ch01-data-structures" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
