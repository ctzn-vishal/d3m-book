import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§24.2 Monitoring, Feedback, and Learning Loops | ${book.title}`,
  description:
    'From individual model monitoring to portfolio-level learning — and how the two customer studios work as one system.',
};

export default function Page() {
  return (
    <BookShell slug="ch56-monitoring-feedback" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
