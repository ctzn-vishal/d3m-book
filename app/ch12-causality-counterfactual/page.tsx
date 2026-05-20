import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§9.2 Causality and the Counterfactual | ${book.title}`,
  description:
    'Potential outcomes, counterfactuals, and why the missing comparison is the core object of causal analysis.',
};

export default function Page() {
  return (
    <BookShell slug="ch12-causality-counterfactual" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
