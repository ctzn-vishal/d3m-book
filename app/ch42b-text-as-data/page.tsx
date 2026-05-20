import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§18.2 Text as Data | ${book.title}`,
  description:
    'Document, corpus, token, vocabulary — the vocabulary that every text method in the book relies on.',
};

export default function Page() {
  return (
    <BookShell slug="ch42b-text-as-data" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
