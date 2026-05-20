import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§12.3 Heterogeneous Treatment Effects | ${book.title}`,
  description:
    'Average effects, segment effects, interactions, and why the milk price response is strongest in lower-income ZIP codes.',
};

export default function Page() {
  return (
    <BookShell slug="ch20-heterogeneous-effects" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
