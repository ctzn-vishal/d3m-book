import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§9.1 From Business Rules to Algorithms | ${book.title}`,
  description:
    'Algorithms as repeatable rules learned from data, not magic — the bridge from manager intuition to scored decisions.',
};

export default function Page() {
  return (
    <BookShell slug="ch09-rules-to-algorithms" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
