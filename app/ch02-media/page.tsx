import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§2.4 Media & Information: The Credibility Chasm | ${book.title}`,
  description:
    "Confidence in the press has collapsed across the board since the 1970s. The partisan signal lives in active rejection, not passive distrust: 78% of Republicans now have 'hardly any' confidence in the press, vs. 33% of Democrats.",
};

export default function Page() {
  return (
    <BookShell slug="ch02-media" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
