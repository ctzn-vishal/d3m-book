import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§7.2 The Anxious Liberal — Ideology, Age & Well-Being | ${book.title}`,
  description:
    "Self-reported happiness has long been higher among Conservatives than Liberals, but in the 2020s the gap looks different. The youngest cohort has dropped further than any other group on record.",
};

export default function Page() {
  return (
    <BookShell slug="ch07-anxious-liberal" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
