import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§3 Variable Types and Measurement | ${book.title}`,
  description:
    'Variables are measurement choices, not just columns. The type of a column is a quiet rule about which operations make sense — and the most common analytic errors are type confusions.',
};

export default function Page() {
  return (
    <BookShell slug="ch01-variable-types" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
