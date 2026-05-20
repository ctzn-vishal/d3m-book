import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§15.4 Trees and Ensembles | ${book.title}`,
  description:
    'Decision trees as readable rule sets; random forests and gradient boosting as committees that average out the idiosyncrasies of any one tree.',
};

export default function Page() {
  return (
    <BookShell slug="ch32-trees-ensembles" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
