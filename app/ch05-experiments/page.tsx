import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§5.3 Experiments and A/B Testing | ${book.title}`,
  description:
    'Random assignment, balance, placebo thinking, lift, uncertainty, and business thresholds for experiments.',
};

export default function Page() {
  return (
    <BookShell slug="ch05-experiments" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
