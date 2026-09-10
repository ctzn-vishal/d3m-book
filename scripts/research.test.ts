import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getJournalHighlights, published, working, type Publication } from '../lib/research';

const publication = (venue: string, extra: Partial<Publication> = {}): Publication => ({
  authors: 'Test Author', title: 'Test publication', venue, ...extra,
});

test('journal highlights match the audited publication list', () => {
  assert.equal(published.length, 35);
  assert.equal(working.length, 8);
  assert.deepEqual(Object.fromEntries(getJournalHighlights().map(({ venue, count }) => [venue, count])), {
    'Marketing Science': 12,
    'Journal of Marketing Research': 3,
    'Quantitative Marketing and Economics': 4,
    'Management Science': 1,
    'Journal of Marketing': 1,
    'Journal of Consumer Research': 1,
    'Marketing Letters': 3,
    'Psychological Science': 1,
    'American Political Science Review': 1,
  });
  assert.equal(getJournalHighlights().reduce((sum, journal) => sum + journal.count, 0), 27);
});

test('counts use exact venues, not titles, notes, or overlapping journal names', () => {
  const entries = [
    publication('Marketing Science'),
    publication('Marketing Science'),
    publication('Management Science'),
    publication('Journal of Marketing'),
    publication('Journal of Marketing Research'),
    publication('Working paper', { title: 'Marketing Science', note: 'Submitted to Journal of Marketing Research' }),
    publication('Book chapter', { note: 'Finalist, Best Paper in Marketing Science' }),
    publication('Harvard Business Review'),
  ];
  assert.deepEqual(getJournalHighlights(entries).map(({ abbreviation, count }) => [abbreviation, count]), [
    ['Mkt Sc', 2], ['JMR', 1], ['Mgmt Sc', 1], ['JM', 1],
  ]);
});

test('empty lists and working papers produce no journal highlights', () => {
  assert.deepEqual(getJournalHighlights([]), []);
  assert.deepEqual(getJournalHighlights(working), []);
});

test('counts update when a publication is added without mutating the source', () => {
  const entries = [publication('Quantitative Marketing and Economics')];
  const before = structuredClone(entries);
  assert.equal(getJournalHighlights(entries)[0].count, 1);
  assert.deepEqual(entries, before);
  assert.equal(getJournalHighlights([...entries, publication('Quantitative Marketing and Economics')])[0].count, 2);
});

test('the audited list contains no duplicate titles or DOI links', () => {
  assert.equal(new Set(published.map(publication => publication.title)).size, published.length);
  const urls = published.flatMap(publication => publication.url ? [publication.url] : []);
  assert.equal(new Set(urls).size, urls.length);
});
