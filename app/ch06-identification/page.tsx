import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§6.2 Identification | ${book.title}`,
  description:
    'Identification as the business argument that makes a comparison credible enough to interpret causally.',
};

export default function Page() {
  return (
    <BookShell slug="ch06-identification" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
