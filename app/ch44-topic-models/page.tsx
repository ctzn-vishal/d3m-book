import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§18.5 Topic Models and Text Dashboards | ${book.title}`,
  description:
    'Discovering themes in a corpus without labels — and turning those themes into a dashboard a manager can read.',
};

export default function Page() {
  return (
    <BookShell slug="ch44-topic-models" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
