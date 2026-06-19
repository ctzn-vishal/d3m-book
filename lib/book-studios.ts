import type { Chapter } from '@/lib/book-types';
import { studios } from '@/lib/studios';

/** Interactive studios paired to any article inside a chapter. */
export function studiosForChapter(chapter: Chapter) {
  const slugs = new Set(chapter.articles.map(a => a.slug));
  return studios.filter(s => slugs.has(s.relatedSlug));
}
