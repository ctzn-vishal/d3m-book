import { book } from '@/lib/book-toc';
import { renderD3mOgImage } from '@/lib/og-card';
import { ogImageSize } from '@/lib/share-metadata';
import { findStudio, getStudioSlugs } from '@/lib/studios';

type Props = {
  params: Promise<{ slug: string }>;
};

export const alt = `D3M studio preview card`;
export const size = ogImageSize;
export const contentType = 'image/png';

export function generateStaticParams() {
  return getStudioSlugs().map(slug => ({ slug }));
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const studio = findStudio(slug);

  if (!studio) {
    return renderD3mOgImage({
      eyebrow: 'Interactive Studio',
      title: 'D3M Studio',
      subtitle: book.subtitle,
      accent: '#287D67',
      tags: ['Case study', 'Dashboard', 'Decision systems'],
    });
  }

  return renderD3mOgImage({
    eyebrow: studio.kind === 'exercise' ? 'D3M Exercise' : 'D3M Dashboard',
    title: studio.title,
    subtitle: studio.blurb,
    accent: studio.accent,
    kicker: studio.domain,
    tags: studio.methods,
  });
}
