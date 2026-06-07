import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§5.4 Why Historical Data Is Hard | ${book.title}`,
  description:
    'Confounding, seasonality, reverse causality, omitted variables, and the traps in historical business data.',
};

export default function Page() {
  return (
    <BookShell slug="ch05-historical-data" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
