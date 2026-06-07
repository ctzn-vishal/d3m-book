import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§4.1 Baselines, Indexes, and Benchmarks | ${book.title}`,
  description:
    'Baseline choices decide what a manager sees first. The soup case shows how indexing reveals seasonality while hiding business scale.',
};

export default function Page() {
  return (
    <BookShell slug="ch04-baselines" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
