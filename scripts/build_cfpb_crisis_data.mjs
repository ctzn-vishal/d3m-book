import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_BASE =
  'https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/';

const OUT_DIR = path.join(process.cwd(), 'public', 'studios', 'cfpb-crisis-monitor', 'data');
const OUT_FILE = path.join(OUT_DIR, 'cfpb-crisis-snapshot.json');

const SNAPSHOT = {
  generatedAt: '2026-06-04',
  dateMin: '2012-01-01',
  // Leave out the most recent partial reporting months.
  dateMaxExclusive: '2026-05-01',
};

const INCIDENTS = [
  {
    id: 'wells-fargo-2016',
    label: 'Wells Fargo fake-accounts order',
    date: '2016-09-08',
    product: 'Bank accounts',
    companies: ['WELLS FARGO & COMPANY'],
    description:
      'Regulators announced penalties tied to unauthorized deposit and credit-card accounts. In the complaint data, the bank-account series jumps in September 2016.',
    source:
      'https://www.consumerfinance.gov/about-us/newsroom/consumer-financial-protection-bureau-fines-wells-fargo-100-million-widespread-illegal-practice-secretly-opening-unauthorized-accounts/',
  },
  {
    id: 'equifax-2017',
    label: 'Equifax breach announced',
    date: '2017-09-07',
    product: 'Credit reporting',
    companies: ['EQUIFAX, INC.'],
    description:
      'Equifax announced a cybersecurity incident affecting roughly 143 million U.S. consumers. Credit-reporting complaints immediately become a breach-readiness case study.',
    source: 'https://investor.equifax.com/news-events/press-releases/detail/240/equifax-announces-cybersecurity-incident-involving-consumer',
  },
  {
    id: 'covid-forbearance-2020',
    label: 'COVID mortgage forbearance',
    date: '2020-04-01',
    product: 'Mortgage',
    companies: ['Mortgage servicers'],
    description:
      'CARES Act forbearance reduced immediate payment pressure, but created a servicing workload around enrollment, deferrals, credit reporting, and exits.',
    source:
      'https://www.consumerfinance.gov/data-research/research-reports/complaint-bulletin-mortgage-forbearance-issues-described-consumer-complaints/',
  },
  {
    id: 'credit-reporting-automation',
    label: 'Credit-reporting complaint expansion',
    date: '2022-01-01',
    product: 'Credit reporting',
    companies: ['Equifax', 'Experian', 'TransUnion'],
    description:
      'The 2022-2024 jump is not one scandal; it is a structural shift in the complaint base, heavily concentrated in consumer-reporting disputes.',
    source:
      'https://www.consumerfinance.gov/about-us/blog/consumer-reporting-companies-need-to-target-improvement-in-response-to-high-volume-of-complaints/',
  },
  {
    id: 'synapse-2024',
    label: 'Synapse / Juno frozen funds',
    date: '2024-05-11',
    product: 'Fintech accounts',
    companies: ['CapitalJ Inc. dba Juno'],
    description:
      'The public CFPB complaint field surfaces this mostly through Juno-related narratives rather than a large company aggregate spike.',
    source:
      'https://apnews.com/article/07ecb45f807a8114cac7438e7a66b512',
  },
];

const CATEGORY_RULES = [
  {
    category: 'Credit reporting',
    test: (name) =>
      /credit reporting|consumer reports|credit repair/i.test(name),
  },
  { category: 'Debt collection', test: (name) => /debt collection/i.test(name) },
  { category: 'Mortgage', test: (name) => /^mortgage$/i.test(name) },
  {
    category: 'Bank accounts',
    test: (name) => /checking or savings|bank account/i.test(name),
  },
  {
    category: 'Credit cards',
    test: (name) => /credit card|prepaid card/i.test(name),
  },
  {
    category: 'Money transfer',
    test: (name) => /money transfer|virtual currency|money service/i.test(name),
  },
  { category: 'Student loans', test: (name) => /student loan/i.test(name) },
  { category: 'Vehicle loans', test: (name) => /vehicle loan|consumer loan/i.test(name) },
];

const CATEGORY_ORDER = [
  'Credit reporting',
  'Debt collection',
  'Mortgage',
  'Bank accounts',
  'Credit cards',
  'Money transfer',
  'Student loans',
  'Vehicle loans',
  'Other',
];

function monthKey(value) {
  return String(value).slice(0, 7);
}

function monthAdd(month, delta) {
  const [year, mon] = month.split('-').map(Number);
  const d = new Date(Date.UTC(year, mon - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthsBetween(minInclusive, maxExclusive) {
  const out = [];
  let cursor = monthKey(minInclusive);
  const max = monthKey(maxExclusive);
  while (cursor < max) {
    out.push(cursor);
    cursor = monthAdd(cursor, 1);
  }
  return out;
}

async function fetchJson(endpoint, params) {
  const url = new URL(endpoint, API_BASE);
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, item);
    } else if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: { accept: 'application/json' },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CFPB API ${response.status} for ${url}: ${body.slice(0, 500)}`);
  }
  return response.json();
}

function toSeriesFromBuckets(buckets = []) {
  return buckets
    .map((bucket) => ({
      month: monthKey(bucket.key_as_string),
      n: Number(bucket.doc_count ?? 0),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function findProductBuckets(overview) {
  return overview?.aggregations?.product?.product?.buckets ?? [];
}

function findDateBuckets(overview) {
  return overview?.aggregations?.dateRangeBuckets?.dateRangeBuckets?.buckets ?? [];
}

function companyBuckets(result) {
  return result?.aggregations?.company?.company?.buckets ?? [];
}

function rollingZ(series, window = 12) {
  return series.map((point, idx) => {
    const prior = series.slice(Math.max(0, idx - window), idx).map((d) => d.n);
    if (prior.length < 6) return { ...point, z: null };
    const mean = prior.reduce((a, b) => a + b, 0) / prior.length;
    const variance =
      prior.reduce((acc, value) => acc + (value - mean) ** 2, 0) /
      Math.max(1, prior.length - 1);
    const sd = Math.sqrt(variance);
    return { ...point, z: sd > 0 ? Number(((point.n - mean) / sd).toFixed(2)) : null };
  });
}

function categoryForProduct(product) {
  return CATEGORY_RULES.find((rule) => rule.test(product))?.category ?? 'Other';
}

function buildProductMix(overview, months) {
  const totalsByMonth = new Map(
    toSeriesFromBuckets(findDateBuckets(overview)).map((d) => [d.month, d.n]),
  );
  const byMonth = new Map(
    months.map((month) => [
      month,
      Object.fromEntries(CATEGORY_ORDER.map((category) => [category, 0])),
    ]),
  );

  for (const bucket of findProductBuckets(overview)) {
    const category = categoryForProduct(bucket.key);
    for (const point of toSeriesFromBuckets(bucket.trend_period?.buckets ?? [])) {
      if (!byMonth.has(point.month)) continue;
      byMonth.get(point.month)[category] += point.n;
    }
  }

  return months.map((month) => {
    const row = byMonth.get(month);
    const known = CATEGORY_ORDER.filter((c) => c !== 'Other').reduce(
      (sum, category) => sum + row[category],
      0,
    );
    row.Other = Math.max(0, (totalsByMonth.get(month) ?? known) - known);
    const total = CATEGORY_ORDER.reduce((sum, category) => sum + row[category], 0);
    return {
      month,
      total,
      ...row,
      shares: Object.fromEntries(
        CATEGORY_ORDER.map((category) => [
          category,
          total > 0 ? Number((row[category] / total).toFixed(4)) : 0,
        ]),
      ),
    };
  });
}

function extractCompanySeries(result, companyName) {
  const bucket = companyBuckets(result).find((item) => item.key === companyName);
  return toSeriesFromBuckets(bucket?.trend_period?.buckets ?? []);
}

function mergeSeries(...seriesList) {
  const byMonth = new Map();
  for (const series of seriesList) {
    for (const point of series) {
      byMonth.set(point.month, (byMonth.get(point.month) ?? 0) + point.n);
    }
  }
  return [...byMonth.entries()]
    .map(([month, n]) => ({ month, n }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function annualTotal(series, year) {
  return series
    .filter((d) => d.month.startsWith(`${year}-`))
    .reduce((sum, d) => sum + d.n, 0);
}

function avgShare(productMix, category, startMonth, endMonth) {
  const rows = productMix.filter((d) => d.month >= startMonth && d.month <= endMonth);
  return rows.reduce((sum, d) => sum + d.shares[category], 0) / Math.max(1, rows.length);
}

async function searchCount({ term, company, product, min, max }) {
  const result = await fetchJson('', {
    search_term: term,
    field: 'all',
    date_received_min: min,
    date_received_max: max,
    company,
    product,
    no_aggs: true,
    size: 1,
  });
  return Number(result?.hits?.total?.value ?? 0);
}

async function monthlySearchSeries({ term, minMonth, maxMonthExclusive }) {
  const out = [];
  for (let month = minMonth; month < maxMonthExclusive; month = monthAdd(month, 1)) {
    out.push({
      month,
      n: await searchCount({
        term,
        min: `${month}-01`,
        max: `${monthAdd(month, 1)}-01`,
      }),
    });
  }
  return out;
}

function cleanNarrative(text) {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 620);
}

async function searchNarratives({ id, label, term, company, product, min, max, size = 6 }) {
  const result = await fetchJson('', {
    search_term: term,
    field: 'all',
    date_received_min: min,
    date_received_max: max,
    company,
    product,
    no_aggs: true,
    size,
  });

  const rows = (result?.hits?.hits ?? [])
    .map((hit) => hit._source)
    .filter((row) => row?.has_narrative && row?.complaint_what_happened)
    .map((row) => ({
      complaintId: row.complaint_id,
      date: monthKey(row.date_received),
      company: row.company,
      product: row.product,
      issue: row.issue,
      subIssue: row.sub_issue ?? null,
      state: row.state ?? null,
      text: cleanNarrative(row.complaint_what_happened),
    }))
    .slice(0, 5);

  return {
    id,
    label,
    term,
    totalMatches: Number(result?.hits?.total?.value ?? rows.length),
    rows,
  };
}

async function main() {
  const months = monthsBetween(SNAPSHOT.dateMin, SNAPSHOT.dateMaxExclusive);

  const overview = await fetchJson('trends', {
    date_received_min: SNAPSHOT.dateMin,
    date_received_max: SNAPSHOT.dateMaxExclusive,
    lens: 'overview',
    trend_interval: 'month',
    trend_depth: 200,
  });

  const bankOld = await fetchJson('trends', {
    date_received_min: '2015-01-01',
    date_received_max: '2017-04-01',
    lens: 'product',
    focus: 'Bank account or service',
    sub_lens: 'company',
    trend_interval: 'month',
    trend_depth: 100,
    sub_lens_depth: 20,
  });

  const creditOld = await fetchJson('trends', {
    date_received_min: '2017-04-01',
    date_received_max: '2023-09-01',
    lens: 'product',
    focus: 'Credit reporting, credit repair services, or other personal consumer reports',
    sub_lens: 'company',
    trend_interval: 'month',
    trend_depth: 120,
    sub_lens_depth: 10,
  });

  const creditNew = await fetchJson('trends', {
    date_received_min: '2023-08-01',
    date_received_max: SNAPSHOT.dateMaxExclusive,
    lens: 'product',
    focus: 'Credit reporting or other personal consumer reports',
    sub_lens: 'company',
    trend_interval: 'month',
    trend_depth: 80,
    sub_lens_depth: 10,
  });

  const overviewSeries = toSeriesFromBuckets(findDateBuckets(overview));
  const productMix = buildProductMix(overview, months);
  const wellsBank = rollingZ(extractCompanySeries(bankOld, 'WELLS FARGO & COMPANY'));
  const mortgage = productMix.map((d) => ({ month: d.month, n: d.Mortgage }));
  const equifax = mergeSeries(
    extractCompanySeries(creditOld, 'EQUIFAX, INC.'),
    extractCompanySeries(creditNew, 'EQUIFAX, INC.'),
  );
  const experian = mergeSeries(
    extractCompanySeries(creditOld, 'Experian Information Solutions Inc.'),
    extractCompanySeries(creditNew, 'Experian Information Solutions Inc.'),
  );
  const transunion = mergeSeries(
    extractCompanySeries(creditOld, 'TRANSUNION INTERMEDIATE HOLDINGS, INC.'),
    extractCompanySeries(creditNew, 'TRANSUNION INTERMEDIATE HOLDINGS, INC.'),
  );

  const [synapseMentions, junoMentions] = await Promise.all([
    monthlySearchSeries({
      term: 'Synapse',
      minMonth: '2024-04',
      maxMonthExclusive: '2025-01',
    }),
    monthlySearchSeries({
      term: 'Juno',
      minMonth: '2024-04',
      maxMonthExclusive: '2025-01',
    }),
  ]);

  const narrativeQueries = await Promise.all([
    searchNarratives({
      id: 'wells',
      label: 'Wells Fargo unauthorized accounts',
      term: 'unauthorized account',
      company: 'WELLS FARGO & COMPANY',
      min: '2016-09-01',
      max: '2016-11-01',
    }),
    searchNarratives({
      id: 'equifax',
      label: 'Equifax identity-theft fears',
      term: 'identity theft',
      company: 'EQUIFAX, INC.',
      min: '2017-09-01',
      max: '2018-01-01',
    }),
    searchNarratives({
      id: 'forbearance',
      label: 'Mortgage forbearance confusion',
      term: 'forbearance',
      product: 'Mortgage',
      min: '2020-03-01',
      max: '2021-05-01',
    }),
    searchNarratives({
      id: 'synapse',
      label: 'Synapse / Juno frozen funds',
      term: 'Synapse',
      min: '2024-04-01',
      max: '2025-01-01',
    }),
  ]);

  const creditShare2017 = avgShare(productMix, 'Credit reporting', '2017-01', '2017-12');
  const creditShare2025 = avgShare(productMix, 'Credit reporting', '2025-01', '2025-12');
  const total2022 = annualTotal(overviewSeries, 2022);
  const total2021 = annualTotal(overviewSeries, 2021);
  const wellsSep = wellsBank.find((d) => d.month === '2016-09');
  const wellsAug = wellsBank.find((d) => d.month === '2016-08');
  const mortgageMar2021 = mortgage.find((d) => d.month === '2021-03');

  const snapshot = {
    meta: {
      ...SNAPSHOT,
      apiDateMax: overview?._meta?.date_max ?? null,
      rangeTotal: overviewSeries.reduce((sum, d) => sum + d.n, 0),
      currentIndexTotal: Number(overview?.hits?.total?.value ?? 0),
      source: 'CFPB Consumer Complaint Database public search API',
      sourceUrl:
        'https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/',
    },
    incidents: INCIDENTS,
    metrics: {
      total2022,
      total2021,
      total2022Growth: total2021 ? Number(((total2022 / total2021 - 1) * 100).toFixed(1)) : null,
      creditShare2017: Number((creditShare2017 * 100).toFixed(1)),
      creditShare2025: Number((creditShare2025 * 100).toFixed(1)),
      wellsSep2016: wellsSep?.n ?? null,
      wellsAug2016: wellsAug?.n ?? null,
      wellsSep2016Z: wellsSep?.z ?? null,
      mortgageMar2021: mortgageMar2021?.n ?? null,
      synapseMentions2024: synapseMentions.reduce((sum, d) => sum + d.n, 0),
      junoMentions2024: junoMentions.reduce((sum, d) => sum + d.n, 0),
    },
    categories: CATEGORY_ORDER,
    overview: overviewSeries,
    productMix,
    storySeries: {
      wellsBank,
      creditBureaus: {
        equifax,
        experian,
        transunion,
      },
      mortgage,
      fintechTerms: {
        synapse: synapseMentions,
        juno: junoMentions,
      },
    },
    narratives: narrativeQueries,
    sources: [
      {
        label: 'CFPB complaint API documentation',
        url: 'https://cfpb.github.io/ccdb5-api/documentation/',
      },
      ...INCIDENTS.map((incident) => ({ label: incident.label, url: incident.source })),
    ],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${OUT_FILE}`);
  console.log(
    JSON.stringify(
      {
        rangeTotal: snapshot.meta.rangeTotal,
        total2022,
        total2022Growth: snapshot.metrics.total2022Growth,
        creditShare2017: snapshot.metrics.creditShare2017,
        creditShare2025: snapshot.metrics.creditShare2025,
        wellsSep2016: snapshot.metrics.wellsSep2016,
        wellsSep2016Z: snapshot.metrics.wellsSep2016Z,
        narrativeSets: snapshot.narratives.map((d) => [d.id, d.totalMatches, d.rows.length]),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
