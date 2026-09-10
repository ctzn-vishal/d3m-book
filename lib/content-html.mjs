import { load } from 'cheerio';
import { contentSource, contentIndex, publicPath, assetPath } from './content-urls.mjs';
import { applyChrome } from '../scripts/chrome-blocks.mjs';
import collections from '../content/collections.json' with { type: 'json' };

export function publicContentHtml(html, item, items, requestPath) {
  const source = contentSource(item);
  const index = contentIndex(items);
  const $ = load(html);
  const originalBase = new URL($('base[href]').first().attr('href') || '.', source);
  $('link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], script[data-vs-ld]').remove();
  const base = $('base').first();
  const baseHref = assetPath(originalBase);
  if (base.length) base.attr('href', baseHref);
  else $('head').prepend($('<base>').attr('href', baseHref));
  $('base').slice(1).remove();

  const fragmentUrls = value => value.replace(/url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g, (_, quote, id) => `url(${quote}${requestPath}#${id}${quote})`);
  $('style').each((_, element) => $(element).text(fragmentUrls($(element).text())));
  for (const attr of ['style', 'fill', 'stroke', 'filter', 'clip-path', 'mask']) {
    $(`[${attr}]`).each((_, element) => $(element).attr(attr, fragmentUrls($(element).attr(attr))));
  }

  for (const attr of ['href', 'xlink:href', 'src', 'poster', 'data', 'action']) {
    $(`[${attr.replace(':', '\\:')}]`).not('base').each((_, element) => {
      const node = $(element);
      const value = node.attr(attr);
      if (!value || /^(data:|blob:|javascript:|mailto:|tel:)/i.test(value)) return;
      if ((attr === 'href' || attr === 'xlink:href') && value.startsWith('#')) {
        node.attr(attr, `${requestPath}${value}`);
        return;
      }
      let url;
      try { url = new URL(value, originalBase); } catch { return; }
      if (url.origin !== source.origin) return;
      const target = index.get(url.pathname);
      const navigation = (element.tagName === 'a' || element.tagName === 'area') && attr === 'href';
      node.attr(attr, navigation && target
        ? `${publicPath(target)}${url.search}${url.hash}`
        : /\.html$/i.test(url.pathname) ? url.href : assetPath(url));
    });
  }

  return applyChrome($.html(), {
    key: decodeURIComponent(source.pathname.slice(1)), meta: item,
    candidates: items.filter(i => i.status === 'published' && contentSource(i)),
    siblings: items, collections: collections.collections,
  }).html;
}
