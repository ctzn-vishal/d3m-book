import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/share-metadata';

/**
 * Default policy: allow everyone, including AI answer-engine / search crawlers
 * (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-
 * Extended, CCBot, Bingbot, Googlebot, …) — for an academic site we WANT the
 * visibility + citations. To restrict any specific bot later, add a rule like
 *   { userAgent: 'CCBot', disallow: '/' }
 * before the catch-all. Story sitemap lives on the content host.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: [`${SITE_URL}/sitemap.xml`, 'https://content.vishalsingh.org/sitemap.xml'],
    host: SITE_URL,
  };
}
