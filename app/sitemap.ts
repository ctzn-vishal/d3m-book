import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/share-metadata';
import { allArticles, getAllPartNumerals, getAllChapterNumbers } from '@/lib/book-toc';
import { studios } from '@/lib/studios';
import { getDatasetItems } from '@/lib/gallery';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const corePages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/teaching`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/research`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];

  // Teaching section + chapter landing pages.
  const teachingNav: MetadataRoute.Sitemap = [
    ...getAllPartNumerals().map(
      (n): MetadataRoute.Sitemap[number] => ({
        url: `${SITE_URL}/teaching/part/${n}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    ),
    ...getAllChapterNumbers().map(
      (n): MetadataRoute.Sitemap[number] => ({
        url: `${SITE_URL}/teaching/ch/${n}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    ),
  ];

  // Book articles live at root-level chNN-keyword slugs.
  const bookPages: MetadataRoute.Sitemap = allArticles
    .filter(a => a.status === 'published')
    .map((a): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}/${a.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  // Studios are self-contained HTML; the served file is the canonical URL.
  const studioPages: MetadataRoute.Sitemap = studios.map(
    (s): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}/studios/${s.slug}/index.html`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  );

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

  return [...corePages, ...teachingNav, ...bookPages, ...studioPages, ...datasetPages];
}
