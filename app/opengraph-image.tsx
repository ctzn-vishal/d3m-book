import { book } from '@/lib/book-toc';
import { renderD3mOgImage } from '@/lib/og-card';
import { ogImageSize } from '@/lib/share-metadata';

export const alt = `${book.title} preview card`;
export const size = ogImageSize;
export const contentType = 'image/png';

export default function Image() {
  return renderD3mOgImage({
    eyebrow: 'D3M Book',
    title: book.title,
    subtitle: book.subtitle,
    accent: '#287D67',
    tags: ['Analytics', 'Visualization', 'Decision systems'],
  });
}
