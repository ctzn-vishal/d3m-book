import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PartPage } from '@/components/Book/PartPage';
import { book, findPart, getAllPartNumerals } from '@/lib/book-toc';
import { getPartContent } from '@/lib/book-content';

interface Props {
  params: Promise<{ numeral: string }>;
}

export function generateStaticParams() {
  return getAllPartNumerals().map(numeral => ({ numeral }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { numeral } = await params;
  const found = findPart(numeral);
  if (!found) return { title: 'Not found' };
  const content = getPartContent(numeral);
  const title = `Part ${numeral}: ${found.part.title} — ${book.title}`;
  return {
    title,
    description: content?.summary ?? `Part ${numeral} of ${book.title}.`,
  };
}

export default async function TeachingPartPage({ params }: Props) {
  const { numeral } = await params;
  const found = findPart(numeral);
  if (!found) notFound();

  return <PartPage book={book} part={found.part} index={found.index} prev={found.prev} next={found.next} />;
}
