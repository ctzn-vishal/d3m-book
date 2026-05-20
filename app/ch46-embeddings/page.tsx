import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§19.1 What Are Embeddings? | ${book.title}`,
  description:
    'Embeddings as a coordinate system for meaning — and what changes when documents become vectors.',
};

export default function Page() {
  return (
    <BookShell slug="ch46-embeddings" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
