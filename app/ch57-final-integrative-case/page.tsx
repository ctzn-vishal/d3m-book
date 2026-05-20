import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§25.1 Final Integrative Case: The Bean & Basket Expansion | ${book.title}`,
  description:
    'A strategic Bean & Basket decision that uses every Part of the book at once — and the final memo that ships.',
};

export default function Page() {
  return (
    <BookShell slug="ch57-final-integrative-case" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
