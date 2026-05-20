import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§19.2 Semantic Search and Brand Positioning | ${book.title}`,
  description:
    'Putting embeddings to work — semantic search, embedding-based clustering, and brand positioning from text.',
};

export default function Page() {
  return (
    <BookShell slug="ch47-semantic-search" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
