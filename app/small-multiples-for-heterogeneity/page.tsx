import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§6.2 Small Multiples for Heterogeneity | ${book.title}`,
  description:
    'Small multiples show whether the national soup pattern is broad-based or region-specific, then preview elasticity intuition with log-log scatterplots.',
};

export default function Page() {
  return (
    <BookShell slug="small-multiples-for-heterogeneity" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
