import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§2.6 Data Language Studio | ${book.title}`,
  description: 'A Part I studio for turning raw tables into a reusable data and metric brief.',
};

export default function Page() {
  return (
    <BookShell slug="ch02-studio-data-language" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
