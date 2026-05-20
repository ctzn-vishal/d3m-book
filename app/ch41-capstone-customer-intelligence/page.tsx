import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§17.4 Customer Intelligence Studio | ${book.title}`,
  description:
    'Integrating Part IV — score, segment, target, act, monitor — into a single decision loop, with the artefacts an executive sponsor should expect.',
};

export default function Page() {
  return (
    <BookShell slug="ch41-capstone-customer-intelligence" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
