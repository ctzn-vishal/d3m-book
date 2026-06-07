import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§13.3 Preprocessing, Bag-of-Words, and TF-IDF | ${book.title}`,
  description:
    'Cleaning text into tokens, counting them honestly, and weighting them by how informative they are.',
};

export default function Page() {
  return (
    <BookShell slug="ch13-preprocessing-tfidf" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
