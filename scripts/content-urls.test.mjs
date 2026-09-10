import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { load } from 'cheerio';
import { contentSource, publicPath, publicUrl, publicItem, contentIndex, assetSource } from '../lib/content-urls.mjs';
import { publicContentHtml } from '../lib/content-html.mjs';

const story = {
  id: 'The Economics of Scientific Publishing', type: 'Blog', status: 'published',
  title: 'The Economics of Scientific Publishing', description: 'An essay', tags: [],
  href: 'https://content.vishalsingh.org/articles/The%20Economics%20of%20Scientific%20Publishing.html',
};
const studio = {
  ...story, id: 'religious-composition-dashboard', type: 'Teaching',
  href: 'https://content.vishalsingh.org/studios/religious-composition-dashboard/index.html',
};

test('public URLs are readable, stable across title edits, and independent of storage', () => {
  assert.equal(publicPath(story), '/read/scientific-publishing');
  assert.equal(publicPath(studio), '/studios/religious-composition');
  assert.equal(publicPath({ ...story, title: 'A revised title' }), publicPath(story));
  assert.equal(publicPath({ ...story, id: 'Déjà Vu' }), '/read/deja-vu');
  const item = publicItem(story);
  assert.equal(item.href, '/read/scientific-publishing');
  assert.equal(item.sourceHref, story.href);
  assert.equal(publicUrl(item), 'https://vishalsingh.org/read/scientific-publishing');
  assert.deepEqual(publicItem(item), item);
});

test('external URLs, datasets, drafts and lookalike origins are not proxied', () => {
  for (const href of ['/datasets/test', '/amazon', 'https://example.com/a.html',
    'https://content.vishalsingh.org.evil.test/articles/a.html',
    'https://user:pass@content.vishalsingh.org/articles/a.html']) {
    assert.equal(contentSource({ ...story, href }), null);
    assert.equal(publicItem({ ...story, href }).href, href);
  }
  assert.equal(publicPath({ ...story, status: 'draft' }), null);
  assert.equal(publicPath({ ...story, status: 'hidden' }), null);
  assert.equal(publicPath({ ...story, status: 'unlisted' }), '/read/scientific-publishing');
});

test('canonical, default-slug and original-path aliases resolve to the same item', () => {
  const index = contentIndex([story, studio]);
  assert.equal(index.get('/read/scientific-publishing').id, story.id);
  assert.equal(index.get('/read/the-economics-of-scientific-publishing').id, story.id);
  assert.equal(index.get('/studios/religious-composition-dashboard').id, studio.id);
  assert.equal(index.get('/studios/religious-composition-dashboard/index.html').id, studio.id);
  assert.equal(index.get(new URL(story.href).pathname).id, story.id);
});

test('slug collisions are rejected instead of silently serving another article', () => {
  assert.throws(() => contentIndex([
    { ...story, id: 'a_b' }, { ...story, id: 'a-b', href: story.href.replace('Publishing', 'Publishing-2') },
  ]), /collision/i);
});

test('asset paths stay confined to the fixed public content origin', () => {
  assert.equal(assetSource(['studios', 'example', 'data.json']), 'https://content.vishalsingh.org/studios/example/data.json');
  for (const path of [['..', 'secret'], ['studios', '..', 'secret'], ['studios', '%2e%2e', 'secret'],
    ['studios', 'a/b'], ['studios', 'a\\b'], ['private', 'key'], ['studios', ''], ['studios', '\u0000']]) {
    assert.equal(assetSource(path), null);
  }
});

test('HTML retains assets and local anchors while replacing metadata and navigation', () => {
  const input = '<!doctype html><html><head><title>Original</title><link rel="canonical" href="old"><meta property="og:url" content="old"></head><body>'
    + '<a id="anchor" href="#finding">Finding</a><a id="next" href="../studios/religious-composition-dashboard/index.html?mode=a#chart">Studio</a>'
    + '<script src="./plot.js"></script><img src="/articles/image.png"><div id="finding"></div></body></html>';
  const html = publicContentHtml(input, story, [story, studio], '/read/scientific-publishing?from=ch01');
  const $ = load(html);
  assert.equal($('base').attr('href'), '/_content/articles/');
  assert.equal($('#anchor').attr('href'), '/read/scientific-publishing?from=ch01#finding');
  assert.equal($('#next').attr('href'), '/studios/religious-composition?mode=a#chart');
  assert.equal($('script[src]').attr('src'), '/_content/articles/plot.js');
  assert.equal($('img').attr('src'), '/_content/articles/image.png');
  assert.equal($('link[rel="canonical"]').length, 1);
  assert.equal($('link[rel="canonical"]').attr('href'), publicUrl(story));
  assert.equal($('meta[property="og:url"]').length, 1);
  assert.equal($('meta[property="og:url"]').attr('content'), publicUrl(story));
  const ld = JSON.parse($('script[data-vs-ld]').text());
  assert.equal(ld.url, publicUrl(story));
});

test('existing base URLs and external resources keep their meaning', () => {
  const $ = load(publicContentHtml('<html><head><base href="./assets/"></head><body><img src="plot.png"><a href="#x">X</a></body></html>', studio, [studio], publicPath(studio)));
  assert.equal($('base').attr('href'), '/_content/studios/religious-composition-dashboard/assets/');
  assert.equal($('img').attr('src'), '/_content/studios/religious-composition-dashboard/assets/plot.png');
  assert.equal($('a').filter((_, el) => $(el).text() === 'X').attr('href'), '/studios/religious-composition#x');
});

test('SVG fragment references still target the current document with an asset base', () => {
  const html = '<html><head><style>.chart { clip-path: url(#clip); }</style></head><body><svg><defs><linearGradient id="gradient"/></defs><rect fill="url(#gradient)"/><use xlink:href="#shape"/></svg></body></html>';
  const $ = load(publicContentHtml(html, studio, [studio], '/studios/religious-composition'));
  assert.equal($('rect').attr('fill'), 'url(/studios/religious-composition#gradient)');
  assert.match($.html(), /<use xlink:href="\/studios\/religious-composition#shape"/);
  assert.match($('style').text(), /url\(\/studios\/religious-composition#clip\)/);
});

test('all committed public content has unambiguous routes', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../content/registry.snapshot.json', import.meta.url), 'utf8'));
  const index = contentIndex(snapshot.items);
  assert.ok(index.size > 50);
  for (const item of snapshot.items) {
    if (publicPath(item)) assert.equal(index.get(publicPath(item)).id, item.id);
  }
});
