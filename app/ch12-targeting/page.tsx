import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§12.1 From Segments to Targeting: Ad Platforms and Lookalikes | ${book.title}`,
  description:
    'How analytic segments become operational targeting on an ad platform — and what a lookalike audience really is under the hood.',
};

export default function Page() {
  return (
    <BookShell slug="ch12-targeting" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
