import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§0.1 Data, Storage, Use, and the Decision Loop | ${book.title}`,
  description:
    'The modern data operating system in one chapter: where business data comes from, how it is stored, how it is used, and how the data-to-decision loop connects to the rest of the book.',
};

export default function Page() {
  return (
    <BookShell slug="ch00-data-system" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
