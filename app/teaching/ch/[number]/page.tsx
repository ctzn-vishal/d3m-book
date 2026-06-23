import { notFound, permanentRedirect } from 'next/navigation';
import { findChapter, getAllChapterNumbers, chapterHref } from '@/lib/book-toc';

interface Props {
  params: Promise<{ number: string }>;
}

export function generateStaticParams() {
  return getAllChapterNumbers().map(number => ({ number: String(number) }));
}

/**
 * The chapter overview page was removed — a chapter now opens directly at its
 * first article. This route is kept only as a permanent (308) redirect so old
 * /teaching/ch/N links, bookmarks, and search results land on the right article.
 */
export default async function TeachingChapterRedirect({ params }: Props) {
  const { number } = await params;
  const found = findChapter(Number(number));
  if (!found) notFound();
  permanentRedirect(chapterHref(found.chapter));
}
