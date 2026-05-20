import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§17.2 Recommenders and Ranking | ${book.title}`,
  description:
    'From co-purchase patterns to ranked lists — how recommenders translate similarity and prediction into customer-facing decisions.',
};

export default function Page() {
  return (
    <BookShell slug="ch39-recommenders-ranking" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
