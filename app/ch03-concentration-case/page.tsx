import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§3.3 Case Study: Market Concentration Metrics | ${book.title}`,
  description:
    'An advertising-spend case study on CR1, CR4, HHI, ownership hierarchy, threshold sensitivity, and market-concentration visualization.',
};

export default function Page() {
  return (
    <BookShell slug="ch03-concentration-case" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
