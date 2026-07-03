import type { Metadata } from 'next';
import { book, findArticle } from '@/lib/book-toc';

export const ogImageSize = {
  width: 1200,
  height: 630,
} as const;

// The hub's canonical origin. Vercel's project URL (d3m-book.vercel.app) is NOT
// the public domain, so we anchor on vishalsingh.org for canonicals/sitemaps/OG;
// override with NEXT_PUBLIC_SITE_URL if ever needed.
const fallbackSiteUrl = 'https://vishalsingh.org';

function withProtocol(hostOrUrl: string): string {
  if (/^https?:\/\//i.test(hostOrUrl)) return hostOrUrl;
  return `https://${hostOrUrl}`;
}

export function getMetadataBase(): URL {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;
  return new URL(withProtocol(siteUrl));
}

/** Canonical site origin as a string with no trailing slash, e.g. https://vishalsingh.org */
export const SITE_URL = getMetadataBase().toString().replace(/\/$/, '');

/** Public Tigris content origin (article/dataset host). */
export const CONTENT_ORIGIN = (
  process.env.NEXT_PUBLIC_CONTENT_URL ?? 'https://content.vishalsingh.org'
).replace(/\/$/, '');

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

/**
 * Metadata for a single book article: title/§-number from the TOC, the given
 * description, a canonical link (resolved against metadataBase in the root
 * layout), and the per-slug OG/Twitter card already served by
 * app/[slug]/opengraph-image.tsx for every chapter path.
 */
export function createArticleMetadata(slug: string, description: string): Metadata {
  const found = findArticle(slug);
  if (!found) {
    return { title: 'Not found' };
  }
  const title = `§${found.article.number} ${found.article.title} | ${book.title}`;
  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    ...createPreviewMetadata({
      title,
      description,
      type: 'article',
      imagePath: `/${slug}/opengraph-image`,
      imageAlt: `${found.article.title} preview card`,
    }),
  };
}
