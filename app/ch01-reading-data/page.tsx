import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§1.1 Grain, Structure, and Measurement | ${book.title}`,
  description:
    'Reading a business table on three levels: what one row means (grain), how the rows are arranged (cross-section, time-series, panel, geo, network), and what each column measures (variable types).',
};

export default function Page() {
  return (
    <BookShell slug="ch01-reading-data" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
