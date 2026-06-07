import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§8.2 Cross-Price Elasticity and Substitution | ${book.title}`,
  description:
    'Cross-price elasticity, substitution, complements, cannibalization, and regional competitive response in soup.',
};

export default function Page() {
  return (
    <BookShell slug="ch08-cross-price-elasticity" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
