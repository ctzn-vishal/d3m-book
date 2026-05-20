import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§17.3 Deployment, Monitoring, and Drift | ${book.title}`,
  description:
    'Once the model ships, what changes — and how to tell when the world has moved away from the model.',
};

export default function Page() {
  return (
    <BookShell slug="ch40-deployment-monitoring" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
