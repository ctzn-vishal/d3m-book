import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§8.3 From Elasticity to Pricing Decisions | ${book.title}`,
  description:
    'From elasticity estimates to revenue, margin, guardrails, and an interactive optimal-pricing formula.',
};

export default function Page() {
  return (
    <BookShell slug="ch08-pricing-decisions" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
