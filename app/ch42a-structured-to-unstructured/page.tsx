import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§18.1 From Structured to Unstructured Data | ${book.title}`,
  description:
    'Why text, images, and documents require a representation layer before algorithms can use them.',
};

export default function Page() {
  return (
    <BookShell slug="ch42a-structured-to-unstructured" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
