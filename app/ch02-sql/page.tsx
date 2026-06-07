import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§4 SQL Like Excel | ${book.title}`,
  description:
    'SQL is a structured way to do what spreadsheets already do — filter, sort, group, summarize, look up. Every Excel mental model has a SQL equivalent.',
};

export default function Page() {
  return (
    <BookShell slug="ch02-sql" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
