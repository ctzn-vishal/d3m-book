import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§10 Capstone: Growth Diagnostic | ${book.title}`,
  description:
    'Bean & Basket Coffee: revenue is up 2% chain-wide, but store performance is diverging. Apply Part I — grain, structure, joins, metrics, quality, dashboards — to diagnose where growth is coming from.',
};

export default function Page() {
  return (
    <BookShell slug="ch04-studio-visual-brief" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
