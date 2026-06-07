import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§0.3 How Data Is Used | ${book.title}`,
  description:
    'A practical router from business questions to monitoring, diagnosis, causal learning, prediction, recommendation, optimization, and AI workflows.',
};

export default function Page() {
  return (
    <BookShell slug="ch00-data-uses" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
