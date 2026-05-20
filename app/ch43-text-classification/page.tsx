import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§18.4 Text Classification and Sentiment | ${book.title}`,
  description:
    'Supervised learning on text — ticket routing, complaint categorization, sentiment, and aspect-based sentiment.',
};

export default function Page() {
  return (
    <BookShell slug="ch43-text-classification" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
