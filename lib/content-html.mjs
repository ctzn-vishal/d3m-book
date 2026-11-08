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
  // The asset <base> makes "#id" resolve to /_content/... for links a page builds at runtime and for
  // history.replaceState('#...'). Keep both on the current page. The click fallback listens on window,
  // so a page's own document-level handler runs first and can still preventDefault.
  $('base').first().after(`<script data-vs-hash>(function(){
var H=window.history;['pushState','replaceState'].forEach(function(k){var f=H[k];H[k]=function(s,t,u){if(typeof u==='string'&&u.charAt(0)==='#')u=location.pathname+location.search+u;return f.call(H,s,t,u);};});
window.addEventListener('click',function(e){if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var a=e.target&&e.target.closest?e.target.closest('a[href^="#"]'):null;if(!a||(a.target&&a.target!=='_self'))return;e.preventDefault();var h=a.getAttribute('href');if(h==='#'){scrollTo(0,0);return;}if(location.hash===h){var el=document.getElementById(decodeURIComponent(h.slice(1)));if(el)el.scrollIntoView();}else location.hash=h;});
})();</script>`);

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
