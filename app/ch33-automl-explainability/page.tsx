import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§15.5 AutoML, Explainability, and Model Cards | ${book.title}`,
  description:
    'When algorithm selection is automated, what is left for managers — and how to ship a model with its own one-page contract.',
};

export default function Page() {
  return (
    <BookShell slug="ch33-automl-explainability" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
