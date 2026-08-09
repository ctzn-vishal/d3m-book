// Pure HTML-transformation layer for inject-chrome: builds and upserts the four
// chrome concerns (home pill, OG/canonical, Article JSON-LD, related-stories
// footer) into a bucket HTML string. No S3 / network — everything here is
// deterministic on (html, registry item, candidate pool), so it can be tested
// locally against fixtures before a pipeline run touches production files.
//
// Idempotence contract: applyChrome(applyChrome(html)) === applyChrome(html) for
// unchanged registry inputs — the caller PUTs only when bytes differ, so a
// violation here would rewrite every bucket file on every run.

export const HOME = 'https://vishalsingh.org/';
export const MARKER = 'data-vs-chrome';   // home pill (inject once)
export const OGM = 'data-vs-og';          // social/SEO head tags (upserted)
export const LDM = 'data-vs-ld';          // Article JSON-LD (upserted, articles only)
export const RELM = 'data-vs-related';    // related-stories footer (upserted, articles only)
export const SERM = 'data-vs-series';     // collection/series strip (upserted, articles only)

// ── Home pill (reads ?from=<chapter-slug>; points back to that chapter else home) ──
export const SNIPPET = `
<a href="${HOME}" ${MARKER} aria-label="Back to vishalsingh.org" style="position:fixed!important;top:12px!important;left:12px!important;z-index:2147483646!important;display:inline-flex!important;align-items:center!important;gap:6px!important;margin:0!important;padding:6px 12px!important;border-radius:999px!important;background:rgba(255,255,255,.92)!important;-webkit-backdrop-filter:saturate(180%) blur(8px);backdrop-filter:saturate(180%) blur(8px);border:1px solid #e4dcd0!important;box-shadow:0 1px 2px rgba(40,30,20,.12)!important;font:600 12px/1 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif!important;color:#1c1a17!important;text-decoration:none!important">↖︎ Vishal Singh</a>
<script ${MARKER}>(function(){try{var f=new URLSearchParams(location.search).get('from');if(f&&/^[a-z0-9-]+$/.test(f)){var a=document.querySelector('a[${MARKER}]');if(a){a.href='${HOME}'+f;a.lastChild.textContent='← Back to the book';}}}catch(e){}})();</script>`;

export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── OG/canonical block (upserted) ──
export function ogBlock(m) {
  const img = m.thumbnail
    ? `\n<meta property="og:image" content="${esc(m.thumbnail)}" ${OGM}><meta name="twitter:image" content="${esc(m.thumbnail)}" ${OGM}>`
    : '';
  return `\n<link rel="canonical" href="${esc(m.href)}" ${OGM}>`
    + `\n<meta property="og:type" content="article" ${OGM}>`
    + `\n<meta property="og:site_name" content="Vishal Singh" ${OGM}>`
    + `\n<meta property="og:title" content="${esc(m.title)}" ${OGM}>`
    + `\n<meta property="og:description" content="${esc(m.description)}" ${OGM}>`
    + `\n<meta property="og:url" content="${esc(m.href)}" ${OGM}>`
    + `\n<meta name="twitter:card" content="summary_large_image" ${OGM}>`
    + `\n<meta name="twitter:title" content="${esc(m.title)}" ${OGM}>`
    + `\n<meta name="twitter:description" content="${esc(m.description)}" ${OGM}>`
    + img;
}
// A previously injected block is a contiguous run of marker-tagged tags —
// replace the run IN PLACE (position-stable, so re-runs are byte-identical);
// only a first-time injection inserts at head-start.
const OG_RUN_RE = /(?:\n?<(?:meta|link)\b[^>]*\bdata-vs-og\b[^>]*>)+/;
export function upsertOg(html, m) {
  const block = ogBlock(m);
  if (OG_RUN_RE.test(html)) return html.replace(OG_RUN_RE, block);
  if (!/<head[^>]*>/i.test(html)) return html;
  return html.replace(/(<head[^>]*>)/i, `$1${block}`);
}

// ── Article JSON-LD (articles only, upserted) ──
// Timestamps are the registry's 'YYYY-MM-DD HH:MM:SS' (UTC) → ISO 8601.
const iso = ts => (typeof ts === 'string' && ts.length >= 19 ? ts.slice(0, 10) + 'T' + ts.slice(11, 19) + 'Z' : undefined);
export function ldBlock(m) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: m.title,
    description: m.description,
    ...(m.thumbnail ? { image: [m.thumbnail] } : {}),
    ...(iso(m.createdAt) ? { datePublished: iso(m.createdAt) } : {}),
    ...(iso(m.updatedAt) ? { dateModified: iso(m.updatedAt) } : {}),
    mainEntityOfPage: m.href,
    url: m.href,
    ...(m.tags?.length ? { keywords: m.tags.join(', ') } : {}),
    author: {
      '@type': 'Person',
      name: 'Vishal Singh',
      url: `${HOME}about`,
      affiliation: { '@type': 'CollegeOrUniversity', name: 'New York University, Stern School of Business' },
    },
    publisher: { '@type': 'Person', name: 'Vishal Singh', url: HOME },
  };
  return `\n<script type="application/ld+json" ${LDM}>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}
const LD_RE = /\n?<script type="application\/ld\+json" data-vs-ld>[\s\S]*?<\/script>/;
export function upsertLd(html, m) {
  const block = ldBlock(m);
  if (LD_RE.test(html)) return html.replace(LD_RE, block);
  if (!/<head[^>]*>/i.test(html)) return html;
  return html.replace(/(<head[^>]*>)/i, `$1${block}`);
}

// ── Related-stories footer (articles only, upserted) ──
// Rank by shared topic (strong), shared tags, a small featured nudge; break ties
// by recency; always fill to 4 with the newest published pieces so even an
// un-curated new article (no topic/tags yet) links onward.
const TYPE_WORD = { Blog: 'Data story', Teaching: 'Teaching studio', App: 'Interactive app' };
export function relatedFor(item, candidates) {
  const rec = o => String(o.createdAt ?? '');
  const score = o =>
    (item.topic && o.topic === item.topic ? 3 : 0) +
    (o.tags ?? []).filter(t => (item.tags ?? []).includes(t)).length +
    (o.featured ? 0.5 : 0);
  const ranked = candidates
    .filter(o => o.id !== item.id)
    .map(o => [score(o), o])
    .sort((a, b) => b[0] - a[0] || rec(b[1]).localeCompare(rec(a[1])));
  const picks = ranked.filter(([s]) => s > 0).slice(0, 4).map(([, o]) => o);
  for (const [, o] of ranked) {
    if (picks.length >= 4) break;
    if (!picks.includes(o)) picks.push(o);
  }
  return picks;
}
export function relatedBlock(picks) {
  const lis = picks.map(o => {
    const label = [TYPE_WORD[o.type] ?? o.type, o.topic].filter(Boolean).join(' · ');
    return `<li style="margin:0;padding:0"><a href="${esc(o.href)}" style="color:inherit;font-weight:600;text-decoration:underline;text-underline-offset:3px">${esc(o.title)}</a><div style="font-size:12.5px;opacity:.62;margin-top:3px">${esc(label)}</div></li>`;
  }).join('\n');
  // Theme-neutral: inherits the article's own colors; system font stack; no
  // background so it sits on dark and light pages alike.
  return `<aside ${RELM} aria-label="Related stories" style="max-width:720px;margin:72px auto 0;padding:26px 20px 44px;border-top:1px solid rgba(128,128,128,.35);font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.45">
<h2 style="margin:0 0 16px;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;opacity:.6">Related stories</h2>
<ul style="list-style:none;margin:0;padding:0;display:grid;gap:14px">
${lis}
</ul>
<p style="margin:22px 0 0;font-size:13px"><a href="${HOME}" style="color:inherit;opacity:.75;text-decoration:underline;text-underline-offset:3px">Browse the full gallery →</a></p>
</aside>`;
}
const REL_RE = /\n?<aside data-vs-related[\s\S]*?<\/aside>/;
export function upsertRelated(html, picks) {
  const block = relatedBlock(picks);
  if (REL_RE.test(html)) return html.replace(REL_RE, '\n' + block);
  const i = html.lastIndexOf('</body>');
  return i === -1 ? `${html}\n${block}` : `${html.slice(0, i)}\n${block}\n${html.slice(i)}`;
}

// ── Collection / series strip (articles only, upserted) ──
// This is what makes independently authored HTML files behave like a series
// without any of them being re-edited: membership is registry metadata, and the
// strip is regenerated from it on every pipeline run. Publishing part 6 updates
// parts 1–5 automatically.

/**
 * Resolve one item's place in its collection. Returns null when the item has no
 * collection, when the slug is unknown (no editorial shell to name it), or when
 * it's the only member — a strip announcing a series of one is worse than none.
 *
 * `siblings` should be the full snapshot, including 'unlisted' rows: series
 * parts are normally unlisted so they don't litter the gallery grid, and
 * excluding them would break the chain at the first one.
 */
export function seriesFor(item, siblings, collections) {
  if (!item?.collection) return null;
  const collection = (collections ?? []).find(c => c.slug === item.collection);
  if (!collection) return null;

  const members = siblings
    .filter(o => o.collection === item.collection && o.status !== 'hidden' && o.status !== 'draft')
    .sort((a, b) => {
      const ap = a.part ?? Number.MAX_SAFE_INTEGER;
      const bp = b.part ?? Number.MAX_SAFE_INTEGER;
      return ap !== bp ? ap - bp : String(a.title).localeCompare(String(b.title));
    });
  if (members.length < 2) return null;

  const i = members.findIndex(o => o.id === item.id);
  if (i === -1) return null;

  return {
    collection,
    members,
    index: i,
    // Ordered only when every member is numbered; a half-numbered collection
    // still renders, just without "Part N of M".
    ordered: members.every(o => typeof o.part === 'number'),
    prev: members[i - 1],
    next: members[i + 1],
  };
}

export function seriesBlock(ctx) {
  const { collection, members, index, ordered, prev, next } = ctx;
  const hubHref = collection.href ? `${HOME}${collection.href.replace(/^\//, '')}` : `${HOME}c/${collection.slug}`;

  // "Part 3 of 5" only when the set is closed. While a collection is still
  // being written, a denominator would promise parts that don't exist.
  const position = ordered
    ? collection.status === 'complete'
      ? `Part ${index + 1} of ${members.length}`
      : `Part ${index + 1}`
    : 'Part of';

  const link = (o, dir) =>
    `<a href="${esc(o.href)}" style="display:block;flex:1 1 220px;color:inherit;text-decoration:none;padding:12px 14px;border:1px solid rgba(128,128,128,.3);border-radius:10px">`
    + `<div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.55">${dir}</div>`
    + `<div style="margin-top:4px;font-weight:600;text-decoration:underline;text-underline-offset:3px">${esc(o.title)}</div>`
    + `</a>`;

  const nav = [prev ? link(prev, '← Previous') : '', next ? link(next, 'Next →') : '']
    .filter(Boolean)
    .join('\n');

  return `<aside ${SERM} aria-label="Series navigation" style="max-width:720px;margin:64px auto 0;padding:22px 20px 0;border-top:1px solid rgba(128,128,128,.35);font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.45">
<p style="margin:0 0 14px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.6">${esc(position)} · <a href="${hubHref}" style="color:inherit;text-decoration:underline;text-underline-offset:3px">${esc(collection.title)}</a></p>
${nav ? `<div style="display:flex;flex-wrap:wrap;gap:12px">\n${nav}\n</div>` : ''}
<p style="margin:14px 0 0;font-size:13px"><a href="${hubHref}" style="color:inherit;opacity:.75;text-decoration:underline;text-underline-offset:3px">All ${members.length} parts →</a></p>
</aside>`;
}

const SER_RE = /\n?<aside data-vs-series[\s\S]*?<\/aside>/;
export function upsertSeries(html, ctx) {
  const block = seriesBlock(ctx);
  if (SER_RE.test(html)) return html.replace(SER_RE, '\n' + block);
  // Sit ABOVE the related-stories footer when there is one: "what's next in
  // this series" beats "what else is vaguely similar". Anchoring on the related
  // block also keeps the position stable across re-runs.
  const rel = html.indexOf(`<aside ${RELM}`);
  if (rel !== -1) return `${html.slice(0, rel)}${block}\n${html.slice(rel)}`;
  const i = html.lastIndexOf('</body>');
  return i === -1 ? `${html}\n${block}` : `${html.slice(0, i)}\n${block}\n${html.slice(i)}`;
}

/**
 * Apply every applicable concern to one file. `meta` is the registry snapshot
 * item for this bucket key (or undefined when unregistered — pill only),
 * `candidates` the published related-links pool, `siblings` the full snapshot
 * (incl. unlisted) for series resolution, and `collections` their definitions.
 * Returns the transformed HTML plus which concerns changed it.
 */
export function applyChrome(html, { key, meta, candidates, siblings = [], collections = [] }) {
  const did = { pill: false, og: false, ld: false, rel: false, series: false };
  let out = html;

  if (!out.includes(MARKER)) {
    out = /<body[^>]*>/i.test(out) ? out.replace(/(<body[^>]*>)/i, `$1${SNIPPET}`) : SNIPPET + out;
    did.pill = true;
  }

  if (meta) {
    const next = upsertOg(out, meta);
    if (next !== out) { did.og = true; out = next; }
  }

  if (key.startsWith('articles/') && meta) {
    const withLd = upsertLd(out, meta);
    if (withLd !== out) { did.ld = true; out = withLd; }

    const picks = relatedFor(meta, candidates);
    if (picks.length) {
      const withRel = upsertRelated(out, picks);
      if (withRel !== out) { did.rel = true; out = withRel; }
    }

    // After related, so the strip can anchor above it on first injection.
    const ctx = seriesFor(meta, siblings, collections);
    if (ctx) {
      const withSeries = upsertSeries(out, ctx);
      if (withSeries !== out) { did.series = true; out = withSeries; }
    }
  }

  return { html: out, did };
}
