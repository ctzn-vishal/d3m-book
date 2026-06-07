import { renderD3mOgImage } from '@/lib/og-card';
import { ogImageSize } from '@/lib/share-metadata';

export const alt = 'Lottery ZIP Psychographics case study preview card';
export const size = ogImageSize;
export const contentType = 'image/png';

export default function Image() {
  return renderD3mOgImage({
    eyebrow: 'D3M Case Study',
    title: 'Lottery ZIP Psychographics',
    subtitle: 'A non-causal ZIP-level investigation of neighborhood lottery routines.',
    accent: '#C85B47',
    kicker: 'Unsupervised Learning',
    tags: ['PCA', 'Clustering', 'Demographic gradients'],
  });
}
