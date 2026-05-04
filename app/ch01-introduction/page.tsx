import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§1 Introduction & Methodological Framework | ${book.title}`,
  description:
    "An American's confidence in the executive branch is largely a function of whose team is in charge of it. This chapter shows what else has changed alongside that one number, using the General Social Survey, 1972–2024.",
};

export default function Page() {
  return (
    <BookShell slug="ch01-introduction" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
