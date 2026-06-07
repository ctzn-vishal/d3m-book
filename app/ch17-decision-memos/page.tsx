import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§17.2 Decision Memos | ${book.title}`,
  description:
    'The one-page synthesis document — what it is, what it isn\'t, and a full Bean & Basket example.',
};

export default function Page() {
  return (
    <BookShell slug="ch17-decision-memos" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
