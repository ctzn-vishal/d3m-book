import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `Ch. 6 Social Trust — The Foundational Divide | ${book.title}`,
  description:
    "Generalized social trust didn't decline — it cratered, and the floor is being held up entirely by older, college-educated Americans. The youngest report 7.5%.",
};

export default function Page() {
  return (
    <BookShell slug="ch06-social-trust" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
