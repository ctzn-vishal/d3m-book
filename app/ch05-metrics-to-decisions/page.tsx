import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§5.1 From Metrics to Decisions | ${book.title}`,
  description:
    'A decision-first opening to causal analysis: treatment, outcome, unit, timing, comparison, and the counterfactual question.',
};

export default function Page() {
  return (
    <BookShell slug="ch05-metrics-to-decisions" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
