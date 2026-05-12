import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§6 Reshaping Data | ${book.title}`,
  description:
    'Wide is comfortable for spreadsheets. Long is what charts and models need. The same data; two shapes; one analytic difference that matters.',
};

export default function Page() {
  return (
    <BookShell slug="ch06-reshaping-data" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
