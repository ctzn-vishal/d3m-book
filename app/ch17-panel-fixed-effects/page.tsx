import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§11.3 Panel Data and Fixed Effects | ${book.title}`,
  description:
    'Panel data and fixed effects: comparing stores to themselves over time to sharpen pricing estimates.',
};

export default function Page() {
  return (
    <BookShell slug="ch17-panel-fixed-effects" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
