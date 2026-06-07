import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§8.1 Price Elasticity | ${book.title}`,
  description:
    'Price elasticity, log-log regression, interpretation, and why percentage response matters for pricing decisions.',
};

export default function Page() {
  return (
    <BookShell slug="ch08-price-elasticity" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
