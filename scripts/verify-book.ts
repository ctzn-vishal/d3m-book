/**
 * Build-time guard against book-toc/directory drift (design review P1.2).
 * Pure filesystem + TOC checks, no env vars, no network — runs before
 * `next build` so a stale slug fails the build with a clear message instead
 * of silently rendering the app/[slug] "not yet written" placeholder at a
 * sitemap-listed, published URL.
 *
 * Checks:
 *  - every book-toc article with status 'published' has a matching
 *    app/<slug>/article.mdx and an entry in book-content.ts#articleDescriptions
 *  - every chapter directory under app/ has a matching book-toc entry
 *    (catches an orphaned directory left behind by a rename)
 *
 * Run: node --import tsx scripts/verify-book.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { allArticles } from '../lib/book-toc';
import { getArticleDescription } from '../lib/book-content';

const appDir = path.join(process.cwd(), 'app');
const problems: string[] = [];

const publishedArticles = allArticles.filter(a => a.status === 'published');

for (const a of publishedArticles) {
  const dir = path.join(appDir, a.slug);
  if (!fs.existsSync(dir)) {
    problems.push(`${a.slug}: status 'published' in book-toc.ts but app/${a.slug}/ does not exist`);
    continue;
  }
  if (!fs.existsSync(path.join(dir, 'article.mdx'))) {
    problems.push(`${a.slug}: app/${a.slug}/ exists but has no article.mdx`);
  }
  if (!getArticleDescription(a.slug)) {
    problems.push(`${a.slug}: published but missing from lib/book-content.ts#articleDescriptions`);
  }
}

const knownSlugs = new Set(allArticles.map(a => a.slug));
const chapterDirs = fs
  .readdirSync(appDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^ch\d/.test(d.name))
  .map(d => d.name);

for (const dirName of chapterDirs) {
  if (!knownSlugs.has(dirName)) {
    problems.push(`app/${dirName}/ exists but has no entry in lib/book-toc.ts (orphaned directory?)`);
  }
}

if (problems.length) {
  console.error(`verify-book: ${problems.length} problem(s) found:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

console.log(
  `verify-book: OK — ${publishedArticles.length} published articles verified against app/ and lib/book-content.ts.`
);
