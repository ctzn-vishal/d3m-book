import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/share-metadata';
import { allArticles, getAllPartNumerals } from '@/lib/book-toc';
import { getDatasetItems } from '@/lib/gallery';
import { TOPICS, TOPIC_META } from '@/lib/taxonomy';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const corePages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/teaching`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/teaching/amazon`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${SITE_URL}/research`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/nlp`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];

  // Teaching part landing pages. (Chapters no longer have their own page — they
  // redirect to the first article — so they're intentionally not listed here.)
  const teachingNav: MetadataRoute.Sitemap = getAllPartNumerals().map(
    (n): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}/teaching/part/${n}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  );

  // Book articles live at root-level chNN-keyword slugs.
  const bookPages: MetadataRoute.Sitemap = allArticles
    .filter(a => a.status === 'published')
    .map((a): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}/${a.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  // Topic landing pages — one per canonical topic (lib/taxonomy).
  const topicPages: MetadataRoute.Sitemap = TOPICS.map(
    (t): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}/topic/${TOPIC_META[t].slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  );

  // Studios now live in the Tigris bucket (content.vishalsingh.org/studios/*) and
  // are listed in the content sitemap, not this hub sitemap.

  // Datasets come from the bucket manifest (graceful empty if unreachable at build).
  let datasetPages: MetadataRoute.Sitemap = [];
  try {
    datasetPages = (await getDatasetItems()).map(
      (d): MetadataRoute.Sitemap[number] => ({
        url: `${SITE_URL}${d.href}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    );
  } catch {
    datasetPages = [];
  }

  return [...corePages, ...topicPages, ...teachingNav, ...bookPages, ...datasetPages];
}
