#!/usr/bin/env node
/**
 * Build app/teaching/amazon/data/amazon-reviews.json from the five
 * `merged_results/*.csv` aggregates published at
 * s3://ontopic-public-data/amazon-reviews/ (Tigris).
 *
 * The bucket is anonymously readable over *virtual-host* style URLs
 * (https://ontopic-public-data.t3.storage.dev/...). Path-style
 * (https://t3.storage.dev/ontopic-public-data/...) returns 403, which is why
 * the dataset README tells you to use the S3 protocol — no credentials are
 * needed here.
 *
 * Usage:  pnpm fetch-amazon
 *
 * The page imports the committed JSON, so this only needs to re-run when the
 * upstream aggregates change.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://ontopic-public-data.t3.storage.dev';
const PREFIX = 'amazon-reviews/merged_results';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../app/teaching/amazon/data/amazon-reviews.json'
);

/** Minimal RFC-4180 parser — enough for these files (no embedded quotes). */
function parseCsv(text) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const cols = header.split(',');
  return lines.map(line => {
    const cells = line.split(',');
    return Object.fromEntries(cols.map((c, i) => [c, cells[i]]));
  });
}

async function getCsv(name) {
  const url = `${ORIGIN}/${PREFIX}/${name}.csv`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText} for ${url}`);
  return parseCsv(await resp.text());
}

const r = (v, d = 1) => Number(Number(v).toFixed(d));
const dist = row => [1, 2, 3, 4, 5].map(i => r(row[`rating_${i}_pct`]));

/**
 * Display name for a category key. The upstream keys are snake_case with "and"
 * spelled out; the book's convention is an ampersand.
 */
function label(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\band\b/g, '&')
    .replace(/\bCDs\b/, 'CDs')
    .replace(/\bTV\b/, 'TV');
}

/**
 * Collapse `category × timeKey` rows into one series per category plus an
 * "ALL" series pooled across categories. Rates are averaged weighted by
 * `count` — an unweighted mean would let Subscription_Boxes (16k reviews)
 * count as much as Home_and_Kitchen (67M).
 */
function buildSeries(rows, timeKey, coerce = Number) {
  const byCat = new Map();
  const pooled = new Map();

  for (const row of rows) {
    const n = Number(row.count);
    if (!n) continue;
    const t = coerce(row[timeKey]);
    const cell = {
      t,
      n,
      r: Number(row.avg_rating),
      l: Number(row.avg_review_length),
      v: Number(row.verified_pct),
      d: [1, 2, 3, 4, 5].map(i => Number(row[`rating_${i}_pct`])),
    };
    if (!byCat.has(row.category)) byCat.set(row.category, []);
    byCat.get(row.category).push(cell);

    const acc = pooled.get(t) ?? { t, n: 0, r: 0, l: 0, v: 0, d: [0, 0, 0, 0, 0] };
    acc.n += n;
    acc.r += n * cell.r;
    acc.l += n * cell.l;
    acc.v += n * cell.v;
    cell.d.forEach((p, i) => (acc.d[i] += n * p));
    pooled.set(t, acc);
  }

  const round = c => ({
    t: c.t,
    n: c.n,
    r: r(c.r, 3),
    l: r(c.l),
    v: r(c.v),
    d: c.d.map(p => r(p)),
  });

  const out = { ALL: [...pooled.values()].map(a => round({ ...a, r: a.r / a.n, l: a.l / a.n, v: a.v / a.n, d: a.d.map(p => p / a.n) })) };
  for (const [cat, cells] of byCat) out[cat] = cells.map(round);
  for (const cells of Object.values(out)) cells.sort((a, b) => a.t - b.t);
  return out;
}

async function main() {
  const [stats, yearly, monthly, dayofweek, hourly] = await Promise.all([
    getCsv('category_stats_all'),
    getCsv('ts_yearly_all'),
    getCsv('ts_monthly_all'),
    getCsv('ts_dayofweek_all'),
    getCsv('ts_hourofday_all'),
  ]);

  const categories = stats
    .map(row => ({
      key: row.category,
      label: label(row.category),
      n: Number(row.num_reviews),
      r: r(row.avg_rating, 3),
      l: r(row.avg_review_length),
      v: r(row.verified_pct),
      d: dist(row),
      from: row.min_date.slice(0, 10),
      to: row.max_date.slice(0, 10),
    }))
    .sort((a, b) => b.n - a.n);

  const total = categories.reduce((s, c) => s + c.n, 0);
  // 4 decimals, not 3: the page renders this at 2dp, and 4.185 lands just
  // below the binary tie so `(4.185).toFixed(2)` would print 4.18.
  const weighted = k => r(categories.reduce((s, c) => s + c.n * c[k], 0) / total, 4);

  const payload = {
    meta: {
      totalReviews: total,
      categoryCount: categories.length,
      from: categories.reduce((m, c) => (c.from < m ? c.from : m), '9999'),
      to: categories.reduce((m, c) => (c.to > m ? c.to : m), '0000'),
      avgRating: weighted('r'),
      avgLength: r(categories.reduce((s, c) => s + c.n * c.l, 0) / total),
      verifiedPct: r(categories.reduce((s, c) => s + c.n * c.v, 0) / total),
      dist: [0, 1, 2, 3, 4].map(i =>
        r(categories.reduce((s, c) => s + c.n * c.d[i], 0) / total, 2)
      ),
      source: 'https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023',
      bucket: `${ORIGIN}/${PREFIX}/`,
    },
    categories,
    monthNames: [...new Set(monthly.map(m => m.month_name))],
    dayNames: [...new Map(dayofweek.map(d => [Number(d.day_of_week), d.day_name])).entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, name]) => name),
    series: {
      yearly: buildSeries(yearly, 'year'),
      monthly: buildSeries(monthly, 'month'),
      dayofweek: buildSeries(dayofweek, 'day_of_week'),
      hourly: buildSeries(hourly, 'hour'),
    },
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload));
  const kb = (JSON.stringify(payload).length / 1024).toFixed(0);
  console.log(
    `✓ ${OUT}\n  ${payload.categories.length} categories · ` +
      `${payload.meta.totalReviews.toLocaleString()} reviews · ${kb} KB`
  );
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
