import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§4.6 Visual Decision Brief Studio | ${book.title}`,
  description:
    'A Part II studio that sequences the Progresso soup visuals — indexes, small multiples, uncertainty, and dashboards — into a one-page executive pricing brief, then marks the line the charts cannot cross into causal claims.',
};

export default function Page() {
  return (
    <BookShell slug="ch04-studio-visual-brief" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
