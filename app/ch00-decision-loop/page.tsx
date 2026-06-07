import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§0.4 The Data-to-Decision Loop | ${book.title}`,
  description:
    'The operating loop that connects source activity, storage, evidence assets, decisions, actions, feedback, and governance.',
};

export default function Page() {
  return (
    <BookShell slug="ch00-decision-loop" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
