import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§10.2 Classification Evaluation | ${book.title}`,
  description:
    'Confusion matrix, ROC/PR, calibration, lift, and the threshold–profit curve — the language for grading a classifier on business cost.',
};

export default function Page() {
  return (
    <BookShell slug="ch10-classification-eval" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
