import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§15.6 Case Study: RentHop Hot Listings | ${book.title}`,
  description:
    'A RentHop marketplace prediction case study: feature engineering, location segments, model comparison, and a held-out queue of Hot listing prospects.',
};

export default function Page() {
  return (
    <BookShell slug="renthop-hot-listings-case" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
