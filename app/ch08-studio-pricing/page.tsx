import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§8.4 Pricing and Promotion Strategy Studio | ${book.title}`,
  description:
    'A Part III studio brief that combines counterfactuals, identification, regression, elasticity, and pricing action.',
};

export default function Page() {
  return (
    <BookShell slug="ch08-studio-pricing" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
