import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§4.3 Uncertainty for Managers | ${book.title}`,
  description:
    'Confidence intervals, store coverage, and uncertainty language for managers using the Progresso soup case.',
};

export default function Page() {
  return (
    <BookShell slug="ch04-uncertainty" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
