import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderHeroOgImage } from '@/lib/og-card';
import { ogImageSize } from '@/lib/share-metadata';

export const alt = 'Vishal Singh, NYU Stern';
export const size = ogImageSize;
export const contentType = 'image/png';

export default async function Image() {
  // satori (next/og) can't reliably read WebP dimensions, so public/hero-og.jpg
  // is a pre-cropped JPEG derivative of public/hero.webp at the card's exact
  // aspect ratio (regenerate: sharp(hero.webp).resize(1200,630,{fit:'cover'})).
  const jpg = await readFile(join(process.cwd(), 'public/hero-og.jpg'));
  const imageDataUri = `data:image/jpeg;base64,${jpg.toString('base64')}`;
  return renderHeroOgImage({ imageDataUri });
}
