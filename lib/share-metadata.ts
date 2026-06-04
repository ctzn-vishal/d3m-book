import type { Metadata } from 'next';
import { book } from '@/lib/book-toc';

export const ogImageSize = {
  width: 1200,
  height: 630,
} as const;

const fallbackSiteUrl = 'https://d3m.vercel.app';

function withProtocol(hostOrUrl: string): string {
  if (/^https?:\/\//i.test(hostOrUrl)) return hostOrUrl;
  return `https://${hostOrUrl}`;
}

export function getMetadataBase(): URL {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    fallbackSiteUrl;

  return new URL(withProtocol(siteUrl));
}

export function createPreviewMetadata({
  title,
  description,
  imagePath = '/opengraph-image',
  twitterImagePath,
  imageAlt = `${book.title} preview card`,
  type = 'website',
}: {
  title?: string;
  description?: string;
  imagePath?: string;
  twitterImagePath?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
} = {}): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      siteName: 'D3M',
      type,
      images: [
        {
          url: imagePath,
          width: ogImageSize.width,
          height: ogImageSize.height,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [twitterImagePath ?? imagePath.replace('opengraph-image', 'twitter-image')],
    },
  };
}
