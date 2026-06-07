import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§14.3 Embeddings and Semantic Search | ${book.title}`,
  description:
    'Embeddings as a coordinate system for meaning — and the first thing you build on them: search, clustering, and brand positioning by meaning rather than vocabulary.',
};

export default function Page() {
  return (
    <BookShell slug="ch14-embeddings" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
