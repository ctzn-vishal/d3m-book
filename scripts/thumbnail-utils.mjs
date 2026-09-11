import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { contentSource } from '../lib/content-urls.mjs';

const FORMATS = { jpg: 'jpeg', jpeg: 'jpeg', png: 'png', webp: 'webp' };

export function thumbnailTarget(item) {
  const source = contentSource(item);
  if (!source || !['published', 'unlisted'].includes(item.status)) return null;
  let declared;
  if (item.thumbnail) {
    try { declared = new URL(item.thumbnail); } catch { return null; }
    if (declared.origin !== source.origin || declared.username || declared.password) return null;
  }
  const path = decodeURIComponent(source.pathname.slice(1));
  let key = path.startsWith('articles/')
    ? `${path.slice(0, -5)}/_thumb.webp`
    : `${path.replace(/\/index\.html$/, '').replace(/\.html$/, '')}/preview.jpg`;
  if (declared) key = decodeURIComponent(declared.pathname.slice(1));
  const format = FORMATS[key.split('.').pop().toLowerCase()];
  if (!format || !/^(articles|studios|apps)\//.test(key)) return null;
  return { key, format, href: `${source.origin}/${key.split('/').map(encodeURIComponent).join('/')}` };
}

export async function bucketObjectExists(client, bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || ['NotFound', 'NoSuchKey'].includes(error?.name)) return false;
    throw error;
  }
}

export async function discoverThumbnail(item, exists) {
  if (item.thumbnail) return item.thumbnail;
  const target = thumbnailTarget(item);
  return target && await exists(target.key) ? target.href : undefined;
}

export async function missingThumbnails(items, exists) {
  const missing = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(6, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      const item = items[index];
      const target = thumbnailTarget(item);
      if (target && !(await exists(target.key))) missing[index] = item;
    }
  }));
  return missing.filter(Boolean);
}
