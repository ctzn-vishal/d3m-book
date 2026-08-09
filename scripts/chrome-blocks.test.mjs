// Tests for the pure transformation layer in chrome-blocks.mjs.
//
// Worth having because inject-chrome rewrites every HTML file in the content
// bucket, and the module's core contract is invisible at a glance:
// applyChrome(applyChrome(html)) must equal applyChrome(html) for unchanged
// registry inputs. A violation doesn't error — it silently re-PUTs ~150 files
// on every pipeline run and churns their cache headers.
//
// Run: pnpm test:chrome
import { applyChrome, seriesFor, seriesBlock, upsertSeries, SERM, RELM } from './chrome-blocks.mjs';

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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
