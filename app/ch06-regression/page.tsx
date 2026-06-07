import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§6.1 Regression as Effect Isolation | ${book.title}`,
  description:
    'Regression as a visual and statistical ladder from raw association to adjusted comparison in the soup pricing panel.',
};

export default function Page() {
  return (
    <BookShell slug="ch06-regression" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
