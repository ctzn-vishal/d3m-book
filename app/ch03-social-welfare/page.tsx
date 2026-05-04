import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§3.2 The Social Welfare Domain: Care vs. Fairness | ${book.title}`,
  description:
    "Americans want more government spending, not less, on nearly every domain. What divides the parties is not how much should be spent, but the words the spending is named with. The 'welfare' line and the 'race programs' line are largely the same dollar — and the partisan gap on the second is twice the gap on the first.",
};

export default function Page() {
  return (
    <BookShell slug="ch03-social-welfare" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
