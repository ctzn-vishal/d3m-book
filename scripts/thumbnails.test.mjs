import assert from 'node:assert/strict';
import { test } from 'node:test';
import { thumbnailTarget, discoverThumbnail, missingThumbnails, bucketObjectExists } from './thumbnail-utils.mjs';

const article = {
  id: 'The Economics of Scientific Publishing', type: 'Blog', status: 'published',
  href: 'https://content.vishalsingh.org/articles/The%20Economics%20of%20Scientific%20Publishing.html',
};

test('article image keys decode URL escapes once, while public image URLs encode them once', () => {
  const target = thumbnailTarget(article);
  assert.equal(target.key, 'articles/The Economics of Scientific Publishing/_thumb.webp');
  assert.equal(target.format, 'webp');
  assert.equal(target.href, 'https://content.vishalsingh.org/articles/The%20Economics%20of%20Scientific%20Publishing/_thumb.webp');
  assert.equal(thumbnailTarget({ ...article, href: article.href.replace('Scientific', '100%25') }).key, 'articles/The Economics of 100% Publishing/_thumb.webp');
});

test('nested article paths and curated types do not change image location', () => {
  assert.equal(thumbnailTarget({ ...article, type: 'App', href: 'https://content.vishalsingh.org/articles/HF/story.html' }).key, 'articles/HF/story/_thumb.webp');
});

test('studios regenerate a missing declared PNG at its original path', () => {
  const item = { ...article, type: 'Teaching', href: 'https://content.vishalsingh.org/studios/example/index.html', thumbnail: 'https://content.vishalsingh.org/studios/example/preview.png' };
  assert.deepEqual(thumbnailTarget(item), { key: 'studios/example/preview.png', format: 'png', href: item.thumbnail });
});

test('authored bucket images keep their declared key', () => {
  const item = { ...article, thumbnail: 'https://content.vishalsingh.org/articles/editorial-cover.png' };
  assert.equal(thumbnailTarget(item).key, 'articles/editorial-cover.png');
  assert.equal(thumbnailTarget(item).format, 'png');
});

test('app previews follow the storage folder, not the registry ID', () => {
  assert.equal(thumbnailTarget({ ...article, id: 'curated-id', type: 'App', href: 'https://content.vishalsingh.org/apps/actual-folder/index.html' }).key, 'apps/actual-folder/preview.jpg');
});

test('external pages, authored external images, and nonpublic items are not screenshot targets', () => {
  for (const item of [
    { ...article, href: 'https://example.com/story.html' },
    { ...article, thumbnail: '/handpicked.png' },
    { ...article, thumbnail: 'https://example.com/handpicked.png' },
    { ...article, status: 'draft' }, { ...article, status: 'hidden' },
  ]) assert.equal(thumbnailTarget(item), null);
  assert.ok(thumbnailTarget({ ...article, status: 'unlisted' }));
});

test('missing images are checked in storage, even when a thumbnail URL is present', async () => {
  const withBrokenImage = { ...article, thumbnail: 'https://content.vishalsingh.org/articles/The%20Economics%20of%20Scientific%20Publishing/_thumb.webp' };
  const items = await missingThumbnails([withBrokenImage], async key => {
    assert.equal(key, thumbnailTarget(article).key);
    return false;
  });
  assert.equal(items.length, 1);
  assert.equal(items[0].id, article.id);
  assert.deepEqual(await missingThumbnails([article], async () => true), []);
});

test('registry sync discovers generated app previews without manual gallery edits', async () => {
  const app = { ...article, type: 'App', href: 'https://content.vishalsingh.org/apps/example/index.html' };
  assert.equal(await discoverThumbnail(app, async () => true), 'https://content.vishalsingh.org/apps/example/preview.jpg');
  assert.equal(await discoverThumbnail(app, async () => false), undefined);
  assert.equal(await discoverThumbnail({ ...app, thumbnail: '/custom.png' }, async () => { throw new Error('Must preserve authored image'); }), '/custom.png');
});

test('storage outages are errors, never interpreted as missing images', async () => {
  await assert.rejects(() => missingThumbnails([article], async () => { throw new Error('storage unavailable'); }), /storage unavailable/);
});

test('object lookup treats only NotFound as missing and propagates permission errors', async () => {
  const missing = { send: async () => { throw Object.assign(new Error('missing'), { name: 'NotFound' }); } };
  assert.equal(await bucketObjectExists(missing, 'bucket', 'image.png'), false);
  const denied = { send: async () => { throw Object.assign(new Error('denied'), { $metadata: { httpStatusCode: 403 } }); } };
  await assert.rejects(() => bucketObjectExists(denied, 'bucket', 'image.png'), /denied/);
  const exists = { send: async command => { assert.equal(command.input.Key, 'image.png'); return {}; } };
  assert.equal(await bucketObjectExists(exists, 'bucket', 'image.png'), true);
});
