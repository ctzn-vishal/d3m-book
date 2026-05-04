import type { Metadata } from 'next';
import { BookShell } from '@/components/Book/BookShell';
import { book, findArticle } from '@/lib/book-toc';
import Article from './article.mdx';

export const metadata: Metadata = {
  title: `§2.6 Social & Cultural Institutions: Religion & the Military | ${book.title}`,
  description:
    "Confidence in organized religion has fallen by two-thirds since the 1970s. Confidence in the military peaked at 63% in 1991, held steady through the post-9/11 era, then fell 30 points among Republicans between 2018 and 2024. Two institutions, the same pattern: a Republican-coalition retreat.",
};

export default function Page() {
  return (
    <BookShell slug="ch02-social-cultural-institutions" book={book} findArticle={findArticle}>
      <Article />
    </BookShell>
  );
}
