import type { RegistryItem } from '@/lib/registry-types';
import { assetSource, contentIndex, contentSource, publicPath } from '@/lib/content-urls.mjs';
import { publicContentHtml } from '@/lib/content-html.mjs';

const CACHE = 'public, max-age=60, s-maxage=300';

type Dependencies = {
  readItems?: () => Promise<RegistryItem[]>;
  fetchContent?: typeof fetch;
};

export async function contentResponse(request: Request, segments: string[], assets = false, {
  readItems = async () => (await import('@/lib/registry-db')).getRegistryIncludingUnlisted(),
  fetchContent = fetch,
}: Dependencies = {}): Promise<Response> {
  const source = assetSource(segments);
  const section = segments[0];
  if ((!assets && section !== 'read' && !source) || (assets && !source)) {
    return new Response('Not found', { status: 404 });
  }
  const url = new URL(request.url);
  const path = `/${segments.map(encodeURIComponent).join('/')}`;
  const items = assets && !/\.html$/i.test(path) ? [] : await readItems();
  const item = contentIndex(items).get(path);
  const responseHeaders = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': CACHE, 'X-Content-Type-Options': 'nosniff' };

  if (item) {
    const canonical = publicPath(item)!;
    if (assets || path !== canonical) {
      return new Response(null, { status: 308, headers: { Location: `${canonical}${url.search}` } });
    }
    try {
      const response = await fetchContent(contentSource(item)!.href, {
        method: request.method, redirect: 'error', signal: AbortSignal.timeout(15000), cache: 'no-store',
      });
      if (!response.ok) return new Response('Content unavailable', { status: response.status === 404 ? 404 : 502 });
      if (request.method === 'HEAD') return new Response(null, { headers: responseHeaders });
      const html = publicContentHtml(await response.text(), item, items, `${canonical}${url.search}`);
      return new Response(html, { headers: responseHeaders });
    } catch {
      return new Response('Content temporarily unavailable', { status: 502 });
    }
  }

  if (!source || (!assets && section === 'read')) return new Response('Not found', { status: 404 });
  if (/\.html$/i.test(new URL(source).pathname)) {
    return new Response(null, { status: 307, headers: { Location: `${source}${url.search}` } });
  }
  try {
    const headers = new Headers();
    if (request.headers.has('range')) headers.set('Range', request.headers.get('range')!);
    const response = await fetchContent(`${source}${url.search}`, {
      method: request.method, headers, redirect: 'error', signal: AbortSignal.timeout(15000), cache: 'no-store',
    });
    if (!response.ok && response.status !== 416) return new Response('Asset unavailable', { status: response.status === 404 ? 404 : 502 });
    const type = response.headers.get('content-type') || 'application/octet-stream';
    if (/text\/html|application\/xhtml\+xml/i.test(type)) return new Response('Not found', { status: 404 });
    const outputHeaders = new Headers({
      'Content-Type': type, 'Cache-Control': CACHE,
      'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': 'sandbox',
    });
    for (const name of ['content-range', 'accept-ranges', 'etag', 'last-modified']) {
      const value = response.headers.get(name);
      if (value) outputHeaders.set(name, value);
    }
    return new Response(response.body, { status: response.status, headers: outputHeaders });
  } catch {
    return new Response('Asset temporarily unavailable', { status: 502 });
  }
}
