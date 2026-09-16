// Tests for the pure transformation layer in chrome-blocks.mjs.
//
// Worth having because inject-chrome rewrites every HTML file in the content
// bucket, and the module's core contract is invisible at a glance:
// applyChrome(applyChrome(html)) must equal applyChrome(html) for unchanged
// registry inputs. A violation doesn't error — it silently re-PUTs ~150 files
// on every pipeline run and churns their cache headers.
//
// Run: pnpm test:chrome
import { load } from 'cheerio';
import { applyChrome, seriesFor, seriesBlock, upsertSeries, SERM, RELM, FMM } from './chrome-blocks.mjs';
import { applyFrontMatter, sourceLine, reset, CORPUS_DATE } from './front-matter.mjs';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
};

const COLLECTIONS = [
  { slug: 'ledger', title: 'The Political Ad Ledger', status: 'building' },
  { slug: 'done', title: 'A Finished Set', status: 'complete' },
  { slug: 'bespoke', title: 'Amazon', href: '/amazon', status: 'building' },
];

const mk = (id, part, extra = {}) => ({
  id, title: `Part ${part ?? '?'} title`, description: 'd', href: `https://content.vishalsingh.org/articles/${id}.html`,
  type: 'Blog', status: 'unlisted', tags: [], collection: 'ledger', part, createdAt: '2026-01-01 00:00:00', ...extra,
});
const members = [mk('a', 1), mk('b', 2), mk('c', 3, { status: 'published' })];
const HTML = '<html><head><title>t</title></head><body><h1>Story</h1></body></html>';

console.log('\n— seriesFor —');
ok('resolves middle member', (() => {
  const c = seriesFor(members[1], members, COLLECTIONS);
  return c && c.index === 1 && c.prev.id === 'a' && c.next.id === 'c' && c.ordered;
})());
ok('first member has no prev', (() => {
  const c = seriesFor(members[0], members, COLLECTIONS);
  return c && !c.prev && c.next.id === 'b';
})());
ok('last member has no next', (() => {
  const c = seriesFor(members[2], members, COLLECTIONS);
  return c && c.prev.id === 'b' && !c.next;
})());
ok('null for item with no collection', seriesFor({ id: 'x' }, members, COLLECTIONS) === null);
ok('null for unknown slug', seriesFor(mk('z', 1, { collection: 'nope' }), members, COLLECTIONS) === null);
ok('null for collection of one', seriesFor(mk('solo', 1), [mk('solo', 1)], COLLECTIONS) === null);
ok('excludes hidden and draft siblings', (() => {
  const withJunk = [...members, mk('h', 4, { status: 'hidden' }), mk('d', 5, { status: 'draft' })];
  const c = seriesFor(members[2], withJunk, COLLECTIONS);
  return c && c.members.length === 3 && !c.next;
})());
ok('includes unlisted siblings', (() => {
  const c = seriesFor(members[2], members, COLLECTIONS);
  return c && c.members.length === 3;
})());
ok('unordered when parts missing', (() => {
  const un = [mk('p', undefined), mk('q', undefined)];
  const c = seriesFor(un[0], un, COLLECTIONS);
  return c && !c.ordered;
})());

console.log('\n— seriesBlock —');
const midBlock = seriesBlock(seriesFor(members[1], members, COLLECTIONS));
ok('building collection omits denominator', midBlock.includes('Part 2 ·') && !midBlock.includes('Part 2 of'), midBlock.slice(0, 120));
ok('has prev and next links', midBlock.includes('← Previous') && midBlock.includes('Next →'));
ok('links to generated hub', midBlock.includes('https://vishalsingh.org/c/ledger'));
ok('complete collection shows denominator', (() => {
  const done = members.map(m => ({ ...m, collection: 'done' }));
  return seriesBlock(seriesFor(done[1], done, COLLECTIONS)).includes('Part 2 of 3');
})());
ok('bespoke href used for hub link', (() => {
  const bs = members.map(m => ({ ...m, collection: 'bespoke' }));
  return seriesBlock(seriesFor(bs[1], bs, COLLECTIONS)).includes('https://vishalsingh.org/amazon');
})());
ok('escapes titles', (() => {
  const evil = [mk('e1', 1, { title: 'A <script> & "quote"' }), mk('e2', 2)];
  const b = seriesBlock(seriesFor(evil[1], evil, COLLECTIONS));
  return b.includes('&lt;script&gt;') && b.includes('&amp;') && !b.includes('<script>');
})());

console.log('\n— idempotence (the contract) —');
const ctx = { key: 'articles/b.html', meta: members[1], candidates: members, siblings: members, collections: COLLECTIONS };
const once = applyChrome(HTML, ctx).html;
const twice = applyChrome(once, ctx).html;
const thrice = applyChrome(twice, ctx).html;
ok('applyChrome is idempotent', once === twice && twice === thrice);
ok('second pass reports no changes', (() => {
  const { did } = applyChrome(once, ctx);
  return !did.pill && !did.og && !did.ld && !did.rel && !did.series;
})());
ok('series strip present exactly once', (once.match(new RegExp(SERM, 'g')) || []).length === 1);
ok('series sits above related', once.indexOf(`<aside ${SERM}`) < once.indexOf(`<aside ${RELM}`));

console.log('\n— upsert re-renders on data change —');
const renamed = { ...ctx, siblings: members.map(m => (m.id === 'c' ? { ...m, title: 'Renamed part' } : m)) };
const after = applyChrome(once, renamed).html;
ok('next-title change propagates', after.includes('Renamed part'));
ok('still one strip after re-render', (after.match(new RegExp(SERM, 'g')) || []).length === 1);
ok('re-render is itself idempotent', applyChrome(after, renamed).html === after);

console.log('\n— no collection means no strip —');
const plain = { key: 'articles/x.html', meta: { ...mk('x', undefined), collection: undefined }, candidates: members, siblings: members, collections: COLLECTIONS };
ok('untagged article gets no series block', !applyChrome(HTML, plain).html.includes(SERM));
ok('non-article key gets no series block', !applyChrome(HTML, { ...ctx, key: 'studios/s.html' }).html.includes(SERM));

console.log('\n— front matter: shapes —');
// The four header shapes that cover the corpus: parts as siblings of the title,
// parts one level out from it, a Distill d-byline outside the title element,
// and a file with no dek of its own.
const page = body => `<html><head><style>h1{color:red}</style></head><body>${body}</body></html>`;
const SIBLINGS = page('<header class="masthead"><p class="kicker">The Great Sorting</p><h1>A Title</h1><p class="dek">The finding.</p><div class="byline"><span>Author</span><span>Vishal Singh</span><span>Data</span><span>ANES 1972-2024</span></div></header>');
const NESTED = page('<header class="masthead"><p class="kicker">The Great Sorting</p><div class="wrap"><h1>A Title</h1><p class="dek">The finding.</p></div></header>');
const DISTILL = page('<d-title><h1>A Title</h1><p class="dek">The finding.</p></d-title><d-byline><div>Published</div><div>July 2026</div><div>Corpus</div><div>American Stories</div></d-byline>');
const BARE = page('<header class="mast"><h1>A Title</h1></header>');
const META = { id: 'x', title: 'A Title', description: 'What the registry says.' };
const fm = (html, meta = META) => applyFrontMatter(html, meta).html;

ok('builds from siblings of the title', (() => {
  const $ = load(fm(SIBLINGS));
  return $(`[${FMM}="kicker"]`).text() === 'The Great Sorting'
    && $(`[${FMM}="dek"]`).text() === 'The finding.'
    && $(`[${FMM}="byline"]`).length === 1;
})());
ok('finds parts one level out from the title', (() => {
  const $ = load(fm(NESTED));
  return $(`[${FMM}="kicker"]`).text() === 'The Great Sorting' && $(`[${FMM}="dek"]`).text() === 'The finding.';
})());
ok('finds a d-byline outside the title element', (() => {
  const $ = load(fm(DISTILL));
  return $(`d-byline[${FMM}="hidden"]`).length === 1 && $(`[${FMM}="source"]`).text() === 'American Stories';
})());
ok('falls back to the registry description', load(fm(BARE))(`[${FMM}="dek"]`).text() === 'What the registry says.');
ok('no dek anywhere means no dek element', load(fm(BARE, { id: 'x' }))(`[${FMM}="dek"]`).length === 0);
ok('leaves a document with no title alone', (() => {
  const noTitle = page('<main><p>Just a body.</p></main>');
  const { html, changed } = applyFrontMatter(noTitle, META);
  return !changed && html.includes('Just a body.') && !html.includes(FMM);
})());

console.log('\n— front matter: what it must not do —');
ok('never removes the original parts', (() => {
  const $ = load(fm(SIBLINGS));
  return $(`p.kicker[${FMM}="hidden"]`).length === 1 && $(`p.dek[${FMM}="hidden"]`).length === 1 && $(`div.byline[${FMM}="hidden"]`).length === 1;
})());
ok('never moves or rewrites the h1', (() => {
  const $ = load(fm(SIBLINGS));
  const h1 = $('h1');
  return h1.text() === 'A Title' && h1.parent().is('header.masthead') && h1.attr(FMM) === 'title';
})());
ok('reset returns the document to its input', (() => {
  const $ = load(fm(SIBLINGS));
  reset($);
  return $.html() === load(SIBLINGS).html();
})());
ok('is idempotent', fm(fm(SIBLINGS)) === fm(SIBLINGS));
ok('escapes what it lifts off the page', (() => {
  const evil = page('<header><p class="kicker">Tools &amp; &lt;script&gt;alert(1)&lt;/script&gt;</p><h1>T</h1></header>');
  const out = fm(evil);
  return !/<script>alert\(1\)<\/script>/.test(out) && out.includes('Tools &amp; &lt;script&gt;alert(1)');
})());

console.log('\n— front matter: the byline —');
ok('stamps the corpus date', (() => {
  const $ = load(fm(SIBLINGS));
  return $(`[${FMM}="value"] time`).attr('datetime') === CORPUS_DATE.iso && $(`[${FMM}="value"] time`).text() === CORPUS_DATE.label;
})());
ok('a registry publishedAt wins', (() => {
  const $ = load(fm(SIBLINGS, { ...META, publishedAt: '2025-03-04 00:00:00' }));
  return $(`[${FMM}="value"] time`).attr('datetime') === '2025-03-04' && $(`[${FMM}="value"] time`).text() === 'March 4, 2025';
})());
ok('author and affiliation are the same on every page', (() => {
  const $ = load(fm(SIBLINGS));
  return $(`[${FMM}="label"]`).map((_, el) => $(el).text()).get().join(',') === 'Author,Affiliation,Published'
    && $(`[${FMM}="value"] a`).attr('href') === 'https://vishalsingh.org';
})());
ok('source keeps provenance, drops the old author and date', (() => {
  const $ = load(fm(SIBLINGS));
  const line = $(`[${FMM}="source"]`).text();
  return line === 'ANES 1972-2024';
})());
ok('source drops a label grid down to its values', (() => {
  const $ = load('<div class="byline"><span>Published</span><span>July 2026</span><span>Data</span><span>Gallup World Poll</span></div>');
  return sourceLine($('div.byline'), $) === 'Gallup World Poll';
})());
ok('source keeps a plain-text byline whole', (() => {
  const $ = load('<p class="byline">Life-table estimates 2010-2015, drawn June 2026</p>');
  return sourceLine($('p.byline'), $) === 'Life-table estimates 2010-2015, drawn June 2026';
})());
ok('source splits an inline label from its value', (() => {
  const $ = load('<p class="byline"><b>Data</b> CDC YRBS, national files <b>Sample</b> 36,446 students</p>');
  return sourceLine($('p.byline'), $) === 'CDC YRBS, national files · 36,446 students';
})());
ok('source drops cells that are only a colon label', (() => {
  const $ = load('<p class="byline"><b>Subjects:</b> U.S. 12th-grade seniors <b>Span:</b> 35 survey years</p>');
  return sourceLine($('p.byline'), $) === 'U.S. 12th-grade seniors · 35 survey years';
})());
ok('a byline of nothing but author and date yields no source line', (() => {
  const $ = load('<d-byline><div>Author</div><div>Vishal Singh</div><div>Published</div><div>July 2026</div></d-byline>');
  return sourceLine($('d-byline'), $) === '';
})());

console.log('\n— front matter through applyChrome —');
const fmCtx = { key: 'articles/b.html', meta: members[1], candidates: members, siblings: members, collections: COLLECTIONS };
const real = applyChrome(SIBLINGS, fmCtx);
ok('reports the concern', real.did.fm);
ok('applyChrome stays idempotent with front matter', applyChrome(real.html, fmCtx).html === real.html);
ok('json-ld survives the cheerio round trip exactly once', (real.html.match(/data-vs-ld/g) || []).length === 1);
ok('og block survives the round trip exactly once', (real.html.match(/property="og:title"/g) || []).length === 1);
ok('studios get front matter', applyChrome(SIBLINGS, { ...fmCtx, key: 'studios/s/index.html' }).did.fm);
ok('apps do not', !applyChrome(SIBLINGS, { ...fmCtx, key: 'apps/a/index.html' }).did.fm);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
