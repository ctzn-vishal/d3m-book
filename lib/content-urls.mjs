import slugify from '@sindresorhus/slugify';
import gallery from '../content/gallery.json' with { type: 'json' };

const CONTENT = new URL(process.env.NEXT_PUBLIC_CONTENT_URL || 'https://content.vishalsingh.org').origin;
const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://vishalsingh.org';
const SITE = new URL(/^https?:\/\//.test(site) ? site : `https://${site}`).origin;
export { SITE as PUBLIC_SITE_URL };
const SECTIONS = { articles: 'read', studios: 'studios', apps: 'apps' };
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function contentSource(item) {
  try {
    const url = new URL(item.sourceHref ?? item.href);
    return url.origin === CONTENT && !url.username && !url.password
      && /^\/(articles|studios|apps)\/.+\.html$/.test(url.pathname) ? url : null;
  } catch {
    return null;
  }
}

export function publicPath(item) {
  const source = contentSource(item);
  if (!source || (item.status && !['published', 'unlisted'].includes(item.status))) return null;
  const slug = gallery.publicSlugs[item.id]?.slug ?? slugify(item.id);
  if (!SLUG.test(slug)) throw new Error(`Invalid public slug for ${item.id}: ${slug}`);
  return `/${SECTIONS[source.pathname.split('/')[1]]}/${slug}`;
}

export function publicUrl(item) {
  const path = publicPath(item);
  return path ? `${SITE}${path}` : item.href;
}

export function publicItem(item) {
  const path = publicPath(item);
  return path ? {
    ...item, sourceHref: contentSource(item).href, href: path,
    external: false, openInNewTab: !!(item.external || item.openInNewTab),
  } : item;
}

export function contentIndex(items) {
  const index = new Map();
  for (const item of items) {
    const path = publicPath(item);
    if (!path) continue;
    const source = contentSource(item);
    const section = path.split('/')[1];
    const aliases = gallery.publicSlugs[item.id]?.aliases ?? [];
    for (const alias of aliases) {
      if (!SLUG.test(alias)) throw new Error(`Invalid public alias for ${item.id}: ${alias}`);
    }
    const paths = [path, source.pathname, `/${section}/${slugify(item.id)}`,
      ...aliases.map(alias => `/${section}/${alias}`)];
    if (source.pathname.endsWith('/index.html')) paths.push(source.pathname.slice(0, -11));
    for (const route of paths) {
      const prior = index.get(route);
      if (prior && prior.id !== item.id) throw new Error(`Public URL collision at ${route}: ${prior.id} / ${item.id}`);
      index.set(route, item);
    }
  }
  return index;
}

export function assetSource(segments) {
  if (!Object.hasOwn(SECTIONS, segments[0]) || segments.some(s => !s || s === '.' || s === '..' || /[%/\\\u0000-\u001f\u007f]/.test(s))) return null;
  return `${CONTENT}/${segments.map(encodeURIComponent).join('/')}`;
}

export function assetPath(url) {
  return url.origin === CONTENT && /^\/(articles|studios|apps)\//.test(url.pathname)
    ? `/_content${url.pathname}${url.search}${url.hash}` : url.href;
}
