import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§0.1 What Is Data Driven Decision Making? | ${book.title}`,
  description:
    'The stance behind the book — data-decorated vs. data-driven, the decision ladder, and the through-line case.',
};

export default function Page() {
  return (
    <BookShell slug="ch00-1-what-is-d3m" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
