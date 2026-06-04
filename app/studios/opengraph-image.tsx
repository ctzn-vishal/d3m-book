import { book } from '@/lib/book-toc';
import { renderD3mOgImage } from '@/lib/og-card';
import { ogImageSize } from '@/lib/share-metadata';
import { studios } from '@/lib/studios';

export const alt = `D3M case study and dashboard gallery preview card`;
export const size = ogImageSize;
export const contentType = 'image/png';

export default function Image() {
  return renderD3mOgImage({
    eyebrow: 'Interactive Studios',
    title: 'Case Study & Dashboard Gallery',
    subtitle: `${studios.length} self-contained dashboards and exercises from ${book.title}.`,
    accent: '#2563A6',
    tags: ['Dashboards', 'Cases', 'Classroom-ready'],
  });
}
