import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§17.6 The Horizon | ${book.title}`,
  description:
    'Where agent-operated analytics is headed: the bull case beside the failure rates, why most deployments fail and which succeed, the semantic layer as the durable contract, the reliability ceiling, and the analyst’s new job above the loop.',
};

export default function Page() {
  return (
    <BookShell slug="ch17-horizon" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
