import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contentResponse } from '../lib/content-response';
import type { RegistryItem } from '../lib/registry-types';

const studio: RegistryItem = {
  id: 'religious-composition-dashboard', type: 'Teaching', status: 'published',
  title: 'Religious composition', description: 'A dashboard', tags: [], accent: '', featured: false, external: true,
  href: 'https://content.vishalsingh.org/studios/religious-composition-dashboard/index.html',
};
const readItems = async () => [studio];
const noFetch: typeof fetch = async () => { throw new Error('Unexpected upstream request'); };

test('legacy studio URLs redirect directly to the canonical URL, retaining query parameters', async () => {
  for (const parts of [['studios', studio.id], ['studios', studio.id, 'index.html']]) {
    const response = await contentResponse(new Request(`https://vishalsingh.org/${parts.join('/')}?from=ch01&mode=map`), parts, false, { readItems, fetchContent: noFetch });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), '/studios/religious-composition?from=ch01&mode=map');
  }
});

test('HTML is served with clean metadata without forwarding request cookies or authorization', async () => {
  const fetchContent: typeof fetch = async (input, init) => {
    assert.equal(input, studio.href);
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.headers, undefined);
    assert.ok(init?.signal);
    return new Response('<html><head></head><body><h1>Dashboard</h1></body></html>', {
      headers: { 'content-type': 'text/html', 'set-cookie': 'unexpected=1', 'etag': 'old' },
    });
  };
  const response = await contentResponse(new Request('https://vishalsingh.org/studios/religious-composition', {
    headers: { cookie: 'private=1', authorization: 'Bearer private' },
  }), ['studios', 'religious-composition'], false, { readItems, fetchContent });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(response.headers.get('etag'), null);
  assert.match(await response.text(), /https:\/\/vishalsingh.org\/studios\/religious-composition/);
});

test('HEAD uses an upstream HEAD and returns no body', async () => {
  const fetchContent: typeof fetch = async (_, init) => {
    assert.equal(init?.method, 'HEAD');
    return new Response(null, { headers: { 'content-type': 'text/html' } });
  };
  const response = await contentResponse(new Request('https://vishalsingh.org/studios/religious-composition', { method: 'HEAD' }), ['studios', 'religious-composition'], false, { readItems, fetchContent });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});

test('unknown clean slugs and invalid asset paths return 404 without an upstream fetch', async () => {
  for (const [parts, assets] of [
    [['read', 'missing'], false], [['private', 'secret'], true], [['studios', '..', 'secret'], true],
    [['studios', '%2fsecret'], true], [['studios', 'https://evil.test'], true],
  ] as [string[], boolean][]) {
    const response = await contentResponse(new Request('https://vishalsingh.org/ignored'), parts, assets, { readItems, fetchContent: noFetch });
    assert.equal(response.status, 404);
  }
});

test('asset requests preserve ranges and query strings without reading the database', async () => {
  const fetchContent: typeof fetch = async (input, init) => {
    assert.equal(input, 'https://content.vishalsingh.org/studios/example/data.json?v=2');
    assert.equal(new Headers(init?.headers).get('range'), 'bytes=0-2');
    assert.equal(new Headers(init?.headers).get('cookie'), null);
    return new Response('123', { status: 206, headers: { 'content-type': 'application/json', 'content-range': 'bytes 0-2/10', 'set-cookie': 'unexpected=1' } });
  };
  const response = await contentResponse(new Request('https://vishalsingh.org/_content/studios/example/data.json?v=2', {
    headers: { range: 'bytes=0-2', cookie: 'private=1' },
  }), ['studios', 'example', 'data.json'], true, {
    readItems: async () => { throw new Error('Asset requested registry'); }, fetchContent,
  });
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('content-range'), 'bytes 0-2/10');
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(await response.text(), '123');
});

test('upstream failures return bounded errors and HTML cannot masquerade as an asset', async () => {
  for (const [fetchContent, status] of [
    [async () => new Response('missing', { status: 404 }), 404],
    [async () => new Response('bad', { status: 500 }), 502],
    [async () => { throw new Error('offline'); }, 502],
    [async () => new Response('<html></html>', { headers: { 'content-type': 'text/html' } }), 404],
  ] as [typeof fetch, number][]) {
    const response = await contentResponse(new Request('https://vishalsingh.org/_content/articles/a.json'), ['articles', 'a.json'], true, { readItems, fetchContent });
    assert.equal(response.status, status);
  }
});

test('HTML asset links redirect to canonical routes rather than serving duplicates', async () => {
  const response = await contentResponse(new Request('https://vishalsingh.org/_content/studios/religious-composition-dashboard/index.html'), ['studios', studio.id, 'index.html'], true, { readItems, fetchContent: noFetch });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), '/studios/religious-composition');
});
