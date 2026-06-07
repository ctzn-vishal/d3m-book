import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§9.3 Train/Test Splits, Generalization, and Leakage | ${book.title}`,
  description:
    'Why a model that ranks the past perfectly may not survive the future — and the leakage traps that hide in plain sight.',
};

export default function Page() {
  return (
    <BookShell slug="ch09-generalization" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
