import { book, findArticle, getAllSlugs } from '@/lib/book-toc';
import { renderD3mOgImage } from '@/lib/og-card';
import { ogImageSize } from '@/lib/share-metadata';

type Props = {
  params: Promise<{ slug: string }>;
};

export const alt = `D3M article preview card`;
export const size = ogImageSize;
export const contentType = 'image/png';

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const found = findArticle(slug);

  if (!found) {
    return renderD3mOgImage({
      eyebrow: 'D3M Article',
      title: book.title,
      subtitle: book.subtitle,
      accent: '#287D67',
      tags: ['Article', 'Analytics', 'Decision systems'],
    });
  }

  return renderD3mOgImage({
    eyebrow: `Article ${found.article.number}`,
    title: found.article.title,
    subtitle: book.subtitle,
    accent: '#287D67',
    tags: [`Part ${found.article.partNumeral}`, `Chapter ${found.article.chapter}`, found.article.status],
  });
}
