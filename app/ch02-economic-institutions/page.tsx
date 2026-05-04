import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§2.5 Economic Institutions: Class & Party Intersect | ${book.title}`,
  description:
    "After fifty years of higher Republican confidence in major companies, the partisan gap on big business closed in 2024. The 2008 financial crisis remade banks. Organized labor's age polarity reversed completely. Three economic institutions, three different stories.",
};

export default function Page() {
  return (
    <BookShell slug="ch02-economic-institutions" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
