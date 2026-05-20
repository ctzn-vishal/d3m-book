import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§15.1 Logistic Regression for Churn Scoring | ${book.title}`,
  description:
    'From log-odds to a sortable probability score — how logistic regression turns a binary outcome into a managerial dial.',
};

export default function Page() {
  return (
    <BookShell slug="ch29-logistic-churn" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
