import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§15.3 Numeric Prediction | ${book.title}`,
  description:
    'Predicting a number rather than a class — RMSE, MAE, residuals, and the business cost of being off.',
};

export default function Page() {
  return (
    <BookShell slug="ch31-numeric-prediction" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
