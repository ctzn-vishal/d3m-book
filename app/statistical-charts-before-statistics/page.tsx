import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§7.2 Statistical Charts Before Statistics | ${book.title}`,
  description:
    'Raw and log distributions, coefficient intervals, and log-log scatterplots as intuitive bridges to later pricing regressions.',
};

export default function Page() {
  return (
    <BookShell slug="statistical-charts-before-statistics" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
