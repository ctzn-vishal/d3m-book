#!/usr/bin/env node
/**
 * Build the Phase 2 chart data for /amazon from
 * s3://ontopic-public-data/amazon-reviews/merged_results_v2/ (29 CSVs, 13.7 MB).
 *
 * Writes one JSON per analysis into app/amazon/data/, so each page imports only
 * what it charts. The raw CSVs are far too big to ship — ts_daily_all alone is
 * 11.4 MB — so everything here is a deliberate reduction: pooled series,
 * capped indices, downsampled curves.
 *
 * Anonymous HTTPS works on *virtual-host* style URLs
 * (https://ontopic-public-data.t3.storage.dev/...). Path-style 403s, which is
 * what the Phase 2 README tested when it concluded the bucket is private — the
 * same wrong turn Phase 1's README took. No credentials needed.
 *
 * Usage:  pnpm fetch-amazon-phase2
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://ontopic-public-data.t3.storage.dev';
const PREFIX = 'amazon-reviews/merged_results_v2';
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../app/amazon/data');

/** RFC-4180 enough: `item_details_keys` has keys containing commas inside quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const t = text.replace(/\r\n/g, '\n');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quoted) {
      if (c === '"') {
        if (t[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  return rows
    .filter(r => r.length === header.length)
    .map(r => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

const cache = new Map();
async function csv(name) {
  if (cache.has(name)) return cache.get(name);
  const url = `${ORIGIN}/${PREFIX}/${name}.csv`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText} for ${url}`);
  const rows = parseCsv(await resp.text());
  cache.set(name, rows);
  return rows;
}

// ── helpers ────────────────────────────────────────────────────────────────
const num = v => (v === '' || v == null ? null : Number(v));
const r1 = v => (v == null ? null : Number(Number(v).toFixed(1)));
const r2 = v => (v == null ? null : Number(Number(v).toFixed(2)));
const r3 = v => (v == null ? null : Number(Number(v).toFixed(3)));
const r4 = v => (v == null ? null : Number(Number(v).toFixed(4)));

/** Pretty category label, matching the Phase 1 convention. */
const label = k => k.replace(/_/g, ' ').replace(/\band\b/g, '&');

/** Count-weighted mean of `pick` over rows, using `w` as the weight field. */
function wmean(rows, pick, w = 'n_reviews') {
  let n = 0;
  let s = 0;
  for (const row of rows) {
    const weight = num(row[w]);
    const v = pick(row);
    if (weight == null || v == null) continue;
    n += weight;
    s += weight * v;
  }
  return n === 0 ? null : s / n;
}

/** Mean rating and 1★/5★ shares from a set of {rating, n_reviews} rows. */
function ratingProfile(rows) {
  const by = new Map();
  let total = 0;
  for (const row of rows) {
    const rat = num(row.rating);
    const n = num(row.n_reviews) ?? 0;
    if (rat == null) continue;
    by.set(rat, (by.get(rat) ?? 0) + n);
    total += n;
  }
  if (!total) return null;
  let mean = 0;
  for (const [rat, n] of by) mean += rat * n;
  const dist = [1, 2, 3, 4, 5].map(i => r2((100 * (by.get(i) ?? 0)) / total));
  return { n: total, mean: r4(mean / total), dist };
}

/** Least-squares slope of y on x — used to summarise a curve as one number. */
function slope(points) {
  const n = points.length;
  if (n < 2) return null;
  const mx = points.reduce((s, p) => s + p[0], 0) / n;
  const my = points.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (const [x, y] of points) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
  }
  return sxx === 0 ? null : sxy / sxx;
}

// ── 1. Reviewers (Tier 3, user grain) ──────────────────────────────────────
async function reviewers() {
  const [oad, conc, lorenz, byIndex, tenure, hist, gaps, bursts, variance] = await Promise.all([
    csv('user_one_and_done'),
    csv('user_concentration_summary'),
    csv('user_review_count_lorenz'),
    csv('user_rating_by_review_index'),
    csv('user_tenure_survival'),
    csv('user_mean_rating_hist'),
    csv('user_inter_review_gaps'),
    csv('user_same_day_bursts'),
    csv('variance_marginal_shares'),
  ]);

  // Activity buckets in reading order, not the CSV's lexical order ("10+" sorts first).
  const ORDER = ['1', '2', '3-4', '5-9', '10+'];
  const activity = ORDER.map(bucket => {
    const rows = oad.filter(r => r.user_activity === bucket);
    return { bucket, ...ratingProfile(rows) };
  }).filter(a => a.n);

  const global = conc.find(r => r.scope === 'global');
  const perCategory = conc
    .filter(r => r.scope === 'category')
    .map(r => ({
      key: r.category,
      label: label(r.category),
      users: num(r.n_users),
      reviews: num(r.n_reviews),
      perUser: r2(r.mean_reviews_per_user),
      gini: r3(r.gini),
      top1: r2(r.top_1pct_share_of_reviews),
      top10: r2(r.top_10pct_share_of_reviews),
    }))
    .sort((a, b) => b.reviews - a.reviews);

  // Lorenz curve: ~60 points is plenty for a smooth line at chart resolution.
  const gl = lorenz.filter(r => r.scope === 'global').map(r => ({
    perUser: num(r.n_reviews_per_user),
    users: r4(r.cum_share_users),
    reviews: r4(r.cum_share_reviews),
  }));
  const step = Math.max(1, Math.floor(gl.length / 60));
  const curve = gl.filter((_, i) => i % step === 0 || i === gl.length - 1);

  const globalIndex = byIndex
    .filter(r => r.scope === 'global' && num(r.review_index) <= 50)
    .map(r => ({ i: num(r.review_index), n: num(r.n_reviews), r: r4(r.mean_rating) }))
    .sort((a, b) => a.i - b.i);

  // Per-category slope over the first 20 reviews: does a reviewer harden?
  const indexSlopes = [...new Set(byIndex.filter(r => r.scope === 'category').map(r => r.category))]
    .map(cat => {
      const pts = byIndex
        .filter(r => r.scope === 'category' && r.category === cat && num(r.review_index) <= 20)
        .map(r => [num(r.review_index), num(r.mean_rating)])
        .filter(p => p[0] != null && p[1] != null);
      return { key: cat, label: label(cat), slope: r4(slope(pts)), points: pts.length };
    })
    .filter(s => s.slope != null && s.points >= 10)
    .sort((a, b) => a.slope - b.slope);

  return {
    activity,
    global: {
      users: num(global.n_users),
      reviews: num(global.n_reviews),
      perUser: r2(global.mean_reviews_per_user),
      gini: r3(global.gini),
      top1: r2(global.top_1pct_share_of_reviews),
      top10: r2(global.top_10pct_share_of_reviews),
    },
    perCategory,
    curve,
    globalIndex,
    indexSlopes,
    tenure: tenure
      .map(r => ({ days: num(r.tenure_bucket_days), users: num(r.n_users), reviews: num(r.n_reviews) }))
      .sort((a, b) => a.days - b.days),
    meanHist: hist
      .filter(r => r.scope === 'global')
      .map(r => ({ bin: r1(r.mean_bin), users: num(r.n_users), reviews: num(r.n_reviews) }))
      .sort((a, b) => a.bin - b.bin),
    gaps: gaps.map(r => ({ days: num(r.gap_bucket_days), n: num(r.n_gaps) })).sort((a, b) => a.days - b.days),
    // Long tail of same-day bursts: keep 1–30 exactly, then one bucket for the rest.
    bursts: (() => {
      const rows = bursts.map(r => ({ k: num(r.reviews_that_day), n: num(r.n_user_days) })).sort((a, b) => a.k - b.k);
      const head = rows.filter(r => r.k <= 30);
      const tailN = rows.filter(r => r.k > 30).reduce((s, r) => s + r.n, 0);
      const tailMax = rows.length ? rows[rows.length - 1].k : 0;
      return { head, tailN, tailMax };
    })(),
    variance: variance.map(r => ({
      factor: r.factor,
      from: r.computed_from,
      groups: num(r.n_groups),
      singletonPct: r2(r.pct_groups_singleton),
      reviewsInSingletonPct: r2(r.pct_reviews_in_singleton_groups),
      marginalPct: r2(r.marginal_variance_explained_pct),
    })),
  };
}

// ── 2. Item rating dynamics (Tier 2, item grain) ───────────────────────────
async function itemDynamics() {
  const [byIndex, first, msd, velocity, lorenz, gaps] = await Promise.all([
    csv('item_rating_by_review_index'),
    csv('item_first_review_effect'),
    csv('item_mean_sd_histogram'),
    csv('item_review_velocity'),
    csv('item_review_count_lorenz'),
    csv('item_inter_review_gaps'),
  ]);

  const cats = [...new Set(byIndex.map(r => r.category))];

  // Pooled curve: weight each category-index cell by its own n.
  const pooledIndex = [];
  for (let i = 1; i <= 50; i++) {
    const rows = byIndex.filter(r => num(r.review_index) === i);
    const n = rows.reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0);
    const m = wmean(rows, r => num(r.mean_rating));
    if (n) pooledIndex.push({ i, n, r: r4(m) });
  }

  const perCategoryIndex = Object.fromEntries(
    cats.map(cat => [
      cat,
      byIndex
        .filter(r => r.category === cat && num(r.review_index) <= 30)
        .map(r => ({ i: num(r.review_index), n: num(r.n_reviews), r: r4(r.mean_rating) }))
        .sort((a, b) => a.i - b.i),
    ])
  );

  const indexSlopes = cats
    .map(cat => {
      const pts = (perCategoryIndex[cat] ?? []).filter(p => p.i >= 2 && p.i <= 20).map(p => [p.i, p.r]);
      const firstCell = (perCategoryIndex[cat] ?? []).find(p => p.i === 1);
      return { key: cat, label: label(cat), slope: r4(slope(pts)), first: firstCell?.r ?? null };
    })
    .filter(s => s.slope != null)
    .sort((a, b) => a.slope - b.slope);

  // First-review effect, pooled: for each first_rating, mean of reviews 2..n.
  const firstEffect = [1, 2, 3, 4, 5].map(fr => {
    const rows = first.filter(r => num(r.first_rating) === fr && num(r.review_index) >= 2);
    return {
      firstRating: fr,
      n: rows.reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0),
      later: r4(wmean(rows, r => num(r.mean_rating))),
    };
  }).filter(f => f.n);

  // Same, per category, so the spread across markets is visible.
  const firstEffectByCategory = cats
    .map(cat => {
      const at = fr => {
        const rows = first.filter(
          r => r.category === cat && num(r.first_rating) === fr && num(r.review_index) >= 2
        );
        return { n: rows.reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0), m: wmean(rows, r => num(r.mean_rating)) };
      };
      const lo = at(1);
      const hi = at(5);
      if (!lo.n || !hi.n || lo.m == null || hi.m == null) return null;
      return { key: cat, label: label(cat), after1: r4(lo.m), after5: r4(hi.m), gap: r4(hi.m - lo.m), n: lo.n + hi.n };
    })
    .filter(Boolean)
    .sort((a, b) => b.gap - a.gap);

  // mean × sd is 12k cells; pool across categories onto the shared grid.
  const grid = new Map();
  for (const row of msd) {
    const mb = r1(row.mean_bin);
    const sb = r1(row.sd_bin);
    if (mb == null || sb == null) continue;
    const k = `${mb}|${sb}`;
    const cur = grid.get(k) ?? { mean: mb, sd: sb, items: 0 };
    cur.items += num(row.n_items) ?? 0;
    grid.set(k, cur);
  }

  const pooledVelocity = [];
  for (const w of [0, 1, 2, 4, 8, 13, 26, 39, 52, 78, 104, 156, 260]) {
    const rows = velocity.filter(r => num(r.weeks_since_first) === w);
    const n = rows.reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0);
    if (n) pooledVelocity.push({ w, n });
  }

  return {
    pooledIndex,
    perCategoryIndex,
    indexSlopes,
    firstEffect,
    firstEffectByCategory,
    meanSd: [...grid.values()].filter(c => c.items > 0),
    velocity: pooledVelocity,
    velocityFull: (() => {
      const out = [];
      for (let w = 0; w <= 104; w++) {
        const rows = velocity.filter(r => num(r.weeks_since_first) === w);
        const n = rows.reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0);
        if (n) out.push({ w, n });
      }
      return out;
    })(),
    gini: lorenz
      .filter(r => num(r.decile_bucket) === 1)
      .map(r => ({ key: r.category, label: label(r.category), gini: r3(r.gini) }))
      .sort((a, b) => b.gini - a.gini),
    gaps: gaps.reduce((acc, r) => {
      const d = num(r.gap_bucket_days);
      acc[d] = (acc[d] ?? 0) + (num(r.n_gaps) ?? 0);
      return acc;
    }, {}),
  };
}

// ── 3. Daily series (Tier 0) ───────────────────────────────────────────────
async function daily() {
  const rows = await csv('ts_daily_all');

  // Pool to one series. `avg_rating` is masked on thin category-days (a
  // documented deviation from the suppression rule), so the rating series is
  // built only from days that report one — and we record the coverage.
  const byDate = new Map();
  for (const row of rows) {
    const d = row.review_date;
    if (!d) continue;
    const n = num(row.n_reviews) ?? 0;
    const cur = byDate.get(d) ?? { d, n: 0, ratedN: 0, ratedSum: 0, verified: 0, verifiedKnown: 0 };
    cur.n += n;
    const ar = num(row.avg_rating);
    if (ar != null) { cur.ratedN += n; cur.ratedSum += n * ar; }
    const v = num(row.n_verified);
    if (v != null) { cur.verified += v; cur.verifiedKnown += n; }
    byDate.set(d, cur);
  }

  const series = [...byDate.values()]
    .sort((a, b) => a.d.localeCompare(b.d))
    .map(x => ({
      d: x.d,
      n: x.n,
      r: x.ratedN ? r3(x.ratedSum / x.ratedN) : null,
      cov: x.n ? r2((100 * x.ratedN) / x.n) : null,
    }));

  // Daily counts only get interesting once volume is real; before 2010 the
  // series is a few hundred a day and the spikes are noise.
  const modern = series.filter(s => s.d >= '2010-01-01');

  const top = [...modern].sort((a, b) => b.n - a.n).slice(0, 25);

  // Day-of-year profile across 2015-2022, indexed to each year's own mean, so
  // the shape of the annual cycle shows without the growth trend in it.
  const byYear = new Map();
  for (const s of series) {
    const y = s.d.slice(0, 4);
    if (y < '2015' || y > '2022') continue;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(s);
  }
  const doyIndex = new Map();
  for (const [, days] of byYear) {
    const mean = days.reduce((s, x) => s + x.n, 0) / days.length;
    for (const x of days) {
      const md = x.d.slice(5);
      const cur = doyIndex.get(md) ?? { md, sum: 0, k: 0 };
      cur.sum += (100 * x.n) / mean;
      cur.k += 1;
      doyIndex.set(md, cur);
    }
  }

  return {
    weekly: (() => {
      // Weekly totals keep the whole 28 years in ~1,450 points.
      const wk = new Map();
      for (const s of series) {
        const dt = new Date(`${s.d}T00:00:00Z`);
        const monday = new Date(dt);
        monday.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
        const k = monday.toISOString().slice(0, 10);
        const cur = wk.get(k) ?? { d: k, n: 0, ratedN: 0, ratedSum: 0 };
        cur.n += s.n;
        if (s.r != null) { cur.ratedN += s.n; cur.ratedSum += s.n * s.r; }
        wk.set(k, cur);
      }
      return [...wk.values()]
        .sort((a, b) => a.d.localeCompare(b.d))
        .map(x => ({ d: x.d, n: x.n, r: x.ratedN ? r3(x.ratedSum / x.ratedN) : null }));
    })(),
    recent: series.filter(s => s.d >= '2019-01-01').map(s => ({ d: s.d, n: s.n, r: s.r })),
    top,
    doy: [...doyIndex.values()].sort((a, b) => a.md.localeCompare(b.md)).map(x => ({ md: x.md, idx: r1(x.sum / x.k) })),
    coverage: {
      days: series.length,
      from: series[0]?.d,
      to: series[series.length - 1]?.d,
      maskedCategoryDays: rows.filter(r => num(r.avg_rating) == null).length,
      totalCategoryDays: rows.length,
    },
  };
}

// ── 4. Cross-category reviewers (Tier 3, X grain) ──────────────────────────
async function crossCategory() {
  const [breadth, cooc, trans, stats] = await Promise.all([
    csv('user_category_breadth'),
    csv('category_cooccurrence'),
    csv('category_transitions'),
    csv('../merged_results/category_stats_all').catch(() => []),
  ]);

  // Category sizes come from Phase 1 — needed to normalise co-occurrence
  // against what independence would predict.
  const size = new Map();
  for (const row of stats) size.set(row.category, num(row.num_reviews));

  const trOut = new Map();
  for (const row of trans) {
    const a = row.category_a;
    trOut.set(a, (trOut.get(a) ?? 0) + (num(row.n_transitions) ?? 0));
  }

  return {
    breadth: breadth
      .map(r => ({ k: num(r.n_categories), users: num(r.n_users), reviews: num(r.n_reviews) }))
      .sort((a, b) => a.k - b.k),
    cooccurrence: cooc.map(r => ({
      a: r.category_a,
      b: r.category_b,
      users: num(r.n_users_both),
    })),
    transitions: trans.map(r => ({
      a: r.category_a,
      b: r.category_b,
      n: num(r.n_transitions),
      // Share of this category's outgoing transitions — the diagonal is
      // "stayed put", which is the number most people want first.
      share: r2((100 * (num(r.n_transitions) ?? 0)) / (trOut.get(r.category_a) || 1)),
    })),
    labels: Object.fromEntries([...new Set(trans.flatMap(r => [r.category_a, r.category_b]))].map(k => [k, label(k)])),
  };
}

// ── 5. The catalogue (Tier 1, item metadata) ───────────────────────────────
async function catalogue() {
  const [price, brands, tree, keys, bought] = await Promise.all([
    csv('item_price_deciles'),
    csv('brand_concentration'),
    csv('item_category_tree'),
    csv('item_details_keys'),
    csv('item_bought_together'),
  ]);

  const topKeys = (() => {
    const agg = new Map();
    for (const row of keys) {
      const k = row.key;
      const cur = agg.get(k) ?? { key: k, items: 0, cats: 0 };
      cur.items += num(row.n_items) ?? 0;
      cur.cats += 1;
      agg.set(k, cur);
    }
    return [...agg.values()].sort((a, b) => b.items - a.items).slice(0, 30);
  })();

  return {
    price: price
      .map(r => ({
        key: r.category,
        label: label(r.category),
        items: num(r.n_items),
        nullPct: r2(r.pct_null_price),
        deciles: [r.p10, r.p20, r.p30, r.p40, r.p50, r.p60, r.p70, r.p80, r.p90].map(v => r2(v)),
      }))
      .sort((a, b) => (b.deciles[4] ?? 0) - (a.deciles[4] ?? 0)),
    brands: brands
      .map(r => ({
        key: r.category,
        label: label(r.category),
        brands: num(r.n_brands),
        items: num(r.total_items),
        reviews: num(r.total_reviews),
        cr4Items: r2(r.cr4_items_pct),
        cr4Reviews: r2(r.cr4_reviews_pct),
        hhiItems: r1(r.hhi_items),
        hhiReviews: r1(r.hhi_reviews),
      }))
      .sort((a, b) => b.hhiReviews - a.hhiReviews),
    tree: tree
      .map(r => ({
        key: r.category,
        label: label(r.category),
        items: num(r.n_items),
        avgDepth: r2(r.avg_depth),
        maxDepth: num(r.max_depth),
        emptyPct: r2(r.pct_empty_categories),
        paths: num(r.n_distinct_paths),
      }))
      .sort((a, b) => (b.avgDepth ?? 0) - (a.avgDepth ?? 0)),
    topKeys,
    detailsCategories: new Set(keys.map(r => r.category)).size,
    // Kept only to state the negative result on the page: every category
    // reports 0% coverage, so the co-purchase graph does not exist here.
    boughtTogether: {
      categories: bought.length,
      withAny: bought.filter(r => (num(r.pct_has_bought_together) ?? 0) > 0).length,
    },
  };
}

// ── 6. Review quality / effort (Tier 0) ────────────────────────────────────
async function reviewQuality() {
  const [helpful, length, hasImage, dup, verified] = await Promise.all([
    csv('helpful_by_category'),
    csv('length_by_rating'),
    csv('rating_x_hasimage'),
    csv('duplicate_text_rates'),
    csv('rating_x_verified'),
  ]);

  // helpful_by_category carries an all-ratings row (blank `rating`) per category.
  const helpfulAll = helpful
    .filter(r => r.rating === '' || r.rating == null)
    .map(r => ({
      key: r.category,
      label: label(r.category),
      n: num(r.n_reviews),
      p50: num(r.p50),
      p90: num(r.p90),
      p99: num(r.p99),
      p999: num(r.p999),
      max: num(r.max_votes),
      zeroPct: r2(r.pct_zero_votes),
    }))
    .sort((a, b) => b.p99 - a.p99);

  const helpfulByRating = [1, 2, 3, 4, 5].map(rat => {
    const rows = helpful.filter(r => num(r.rating) === rat);
    return {
      rating: rat,
      n: rows.reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0),
      p90: r2(wmean(rows, r => num(r.p90))),
      p99: r2(wmean(rows, r => num(r.p99))),
      zeroPct: r2(wmean(rows, r => num(r.pct_zero_votes))),
    };
  });

  const lengthByRating = [1, 2, 3, 4, 5].map(rat => {
    const rows = length.filter(r => num(r.rating) === rat);
    return {
      rating: rat,
      n: rows.reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0),
      words: r1(wmean(rows, r => num(r.mean_words))),
      p50: r1(wmean(rows, r => num(r.p50_words))),
      chars: r1(wmean(rows, r => num(r.mean_chars))),
      excl: r3(wmean(rows, r => num(r.mean_excl))),
      caps: r3(wmean(rows, r => num(r.mean_caps_words))),
    };
  });

  // rating × has_image, pooled. Photos are rare, so the interesting number is
  // the rating profile conditional on having one.
  const imgProfile = ['True', 'False'].map(flag => {
    const rows = hasImage.filter(r => r.has_image === flag);
    return { hasImage: flag === 'True', ...ratingProfile(rows) };
  });
  const imgByCategory = [...new Set(hasImage.map(r => r.category))]
    .map(cat => {
      const withImg = hasImage
        .filter(r => r.category === cat && r.has_image === 'True')
        .reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0);
      const all = hasImage.filter(r => r.category === cat).reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0);
      return { key: cat, label: label(cat), pct: all ? r3((100 * withImg) / all) : null, n: all };
    })
    .filter(x => x.pct != null)
    .sort((a, b) => b.pct - a.pct);

  // rating × verified — the joint Phase 1 could only give as two marginals.
  const verProfile = ['True', 'False'].map(flag => {
    const rows = verified.filter(r => r.verified === flag);
    return { verified: flag === 'True', ...ratingProfile(rows) };
  });
  const verByYear = [...new Set(verified.map(r => r.year))]
    .filter(Boolean)
    .sort()
    .map(y => {
      const t = ratingProfile(verified.filter(r => r.year === y && r.verified === 'True'));
      const f = ratingProfile(verified.filter(r => r.year === y && r.verified === 'False'));
      return { year: Number(y), verified: t, unverified: f };
    })
    .filter(x => x.verified && x.unverified);
  const verByCategory = [...new Set(verified.map(r => r.category))]
    .map(cat => {
      const t = ratingProfile(verified.filter(r => r.category === cat && r.verified === 'True'));
      const f = ratingProfile(verified.filter(r => r.category === cat && r.verified === 'False'));
      if (!t || !f) return null;
      return { key: cat, label: label(cat), v: t.mean, u: f.mean, gap: r4(t.mean - f.mean), n: t.n + f.n };
    })
    .filter(Boolean)
    .sort((a, b) => b.gap - a.gap);

  const dupByYear = [...new Set(dup.map(r => r.year))]
    .filter(Boolean)
    .sort()
    .map(y => {
      const rows = dup.filter(r => r.year === y);
      const n = rows.reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0);
      const inCl = rows.reduce((s, r) => s + (num(r.n_reviews_in_clusters) ?? 0), 0);
      return { year: Number(y), n, pct: n ? r3((100 * inCl) / n) : null };
    })
    .filter(x => x.n > 10000);
  const dupByCategory = [...new Set(dup.map(r => r.category))]
    .map(cat => {
      const rows = dup.filter(r => r.category === cat);
      const n = rows.reduce((s, r) => s + (num(r.n_reviews) ?? 0), 0);
      const inCl = rows.reduce((s, r) => s + (num(r.n_reviews_in_clusters) ?? 0), 0);
      return { key: cat, label: label(cat), n, pct: n ? r3((100 * inCl) / n) : null };
    })
    .filter(x => x.pct != null)
    .sort((a, b) => b.pct - a.pct);

  return {
    helpfulAll,
    helpfulByRating,
    lengthByRating,
    imgProfile,
    imgByCategory,
    verProfile,
    verByYear,
    verByCategory,
    dupByYear,
    dupByCategory,
  };
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  const manifest = await fetch(`${ORIGIN}/${PREFIX}/_meta/manifest_v2.json`).then(r => r.json());

  const parts = {
    'phase2-reviewers': await reviewers(),
    'phase2-item-dynamics': await itemDynamics(),
    'phase2-daily': await daily(),
    'phase2-cross-category': await crossCategory(),
    'phase2-catalogue': await catalogue(),
    'phase2-review-quality': await reviewQuality(),
  };

  // Caveats that must travel with the numbers, lifted from the manifest so the
  // pages can't drift from what the pipeline actually says.
  parts['phase2-meta'] = {
    generated: manifest.generated_at_utc,
    source: `${ORIGIN}/${PREFIX}/`,
    nFiles: manifest.n_published_data_files,
    varianceWarning: manifest.variance_marginal_shares_detail?.IS_NOT_A_DECOMPOSITION ?? null,
    varianceTotals: {
      nReviews: manifest.variance_marginal_shares_detail?.n_reviews ?? null,
      grandMean: manifest.variance_marginal_shares_detail?.grand_mean_rating ?? null,
      totalVariance: manifest.variance_marginal_shares_detail?.total_variance ?? null,
      naiveSumPct: manifest.variance_marginal_shares_detail?.naive_sum_of_marginals_pct ?? null,
    },
    notes: manifest.global_notes ?? [],
    notPublished: (manifest.measures_not_published ?? []).map(m => ({ measure: m.measure, reason: m.reason })),
  };

  await mkdir(OUT_DIR, { recursive: true });
  let total = 0;
  for (const [name, data] of Object.entries(parts)) {
    const json = JSON.stringify(data);
    total += json.length;
    await writeFile(resolve(OUT_DIR, `${name}.json`), json);
    console.log(`  ${name}.json`.padEnd(34) + `${(json.length / 1024).toFixed(0)} KB`);
  }
  console.log(`\n✓ ${Object.keys(parts).length} files · ${(total / 1024).toFixed(0)} KB total → app/amazon/data/`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
