import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChapterPage } from '@/components/hub/ChapterPage';
import { book, findChapter, getAllChapterNumbers } from '@/lib/book-toc';
import { getChapterContent } from '@/lib/book-content';

interface Props {
  params: Promise<{ number: string }>;
}

export function generateStaticParams() {
  return getAllChapterNumbers().map(number => ({ number: String(number) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const found = findChapter(Number(number));
  if (!found) return { title: 'Not found' };
  const content = getChapterContent(found.chapter.number);
  const title = `Chapter ${found.chapter.number}: ${found.chapter.title} — ${book.title}`;
  return {
    title,
    description: content?.throughLine ?? content?.summary ?? `Chapter ${number} of ${book.title}.`,
  };
}

export default async function TeachingChapterPage({ params }: Props) {
  const { number } = await params;
  const found = findChapter(Number(number));
  if (!found) notFound();

  return (
    <ChapterPage
      chapter={found.chapter}
      part={found.part}
      partIndex={found.partIndex}
      prev={found.prev}
      next={found.next}
    />
  );
}
