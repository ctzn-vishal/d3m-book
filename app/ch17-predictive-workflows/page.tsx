import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§17.3 Automated Predictive Workflows | ${book.title}`,
  description:
    'How far data-science agents can take the predictive lifecycle: benchmark evidence (MLE-bench, DSBench, GDPval), what ships today, the agent-driven monitor-and-retrain loop, and the durable-execution layer underneath.',
};

export default function Page() {
  return (
    <BookShell slug="ch17-predictive-workflows" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
