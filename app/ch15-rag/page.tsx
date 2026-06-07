import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§15.1 Retrieval-Augmented Generation | ${book.title}`,
  description:
    'How language models answer using internal company knowledge — chunk, embed, retrieve, ground, cite.',
};

export default function Page() {
  return (
    <BookShell slug="ch15-rag" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
