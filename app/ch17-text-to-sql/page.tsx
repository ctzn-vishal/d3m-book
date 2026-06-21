import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§17.2 Talking to the Warehouse | ${book.title}`,
  description:
    'Querying production databases in natural language: what text-to-SQL benchmarks really show, why it breaks on real schemas, and how the semantic layer becomes the contract that makes agentic analytics trustworthy.',
};

export default function Page() {
  return (
    <BookShell slug="ch17-text-to-sql" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
