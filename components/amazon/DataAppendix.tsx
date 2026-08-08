import { CodeBlock, Section } from './ui';
import { compact, int, type AmazonData } from './types';

const FILES = [
  { name: 'category_stats_all.csv', rows: '33', what: 'One row per category — volume, mean rating, mean length, verified share, the 1★–5★ split, first and last review date.' },
  { name: 'ts_yearly_all.csv', rows: '798', what: 'Category × year, 1996–2023. The only chronological file.' },
  { name: 'ts_monthly_all.csv', rows: '396', what: 'Category × calendar month. Seasonality, all years pooled.' },
  { name: 'ts_dayofweek_all.csv', rows: '231', what: 'Category × weekday (0 = Monday), all years pooled.' },
  { name: 'ts_hourofday_all.csv', rows: '792', what: 'Category × hour (0–23), all years pooled.' },
];

/** Access, file layout, gotchas, provenance. Shared by every /amazon page footer. */
export function DataAppendix({ data }: { data: AmazonData }) {
  const { meta } = data;
  const smallest = [...data.categories].sort((a, b) => a.n - b.n)[0];
  const largest = [...data.categories].sort((a, b) => b.n - a.n)[0];

  return (
    <Section
      eyebrow="The data"
      title="Five CSVs, no text, no identifiers"
      id="data"
      lede={
        <>
          The published aggregates are counts, means, and distributions only — no review text, no
          user ID, no product ID. That is what makes them safe to hand out and what makes them
          useless for per-product or NLP work; for that you need the{' '}
          <a
            href={meta.source}
            className="font-medium text-hub-teal underline decoration-hub-teal/40 underline-offset-2"
          >
            HuggingFace source
          </a>
          .
        </>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-hub-line">
        <table className="w-full min-w-[34rem] border-collapse text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-hub-line bg-hub-paper2">
              <th className="px-4 py-2.5 font-plex text-[10.5px] font-medium uppercase tracking-wider text-hub-ink-faint">File</th>
              <th className="px-4 py-2.5 text-right font-plex text-[10.5px] font-medium uppercase tracking-wider text-hub-ink-faint">Rows</th>
              <th className="px-4 py-2.5 font-plex text-[10.5px] font-medium uppercase tracking-wider text-hub-ink-faint">What it holds</th>
            </tr>
          </thead>
          <tbody>
            {FILES.map(f => (
              <tr key={f.name} className="border-b border-hub-line last:border-0">
                <td className="whitespace-nowrap px-4 py-2.5 align-top font-plex text-[12px] text-hub-ink">{f.name}</td>
                <td className="px-4 py-2.5 text-right align-top font-plex text-[12px] tabular-nums text-hub-ink-faint">{f.rows}</td>
                <td className="px-4 py-2.5 align-top leading-snug text-hub-ink-soft">{f.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <CodeBlock
          label="Plain HTTPS — no credentials"
          code={`import pandas as pd

BASE = "${meta.bucket}"
cats = pd.read_csv(BASE + "category_stats_all.csv")
yrs  = pd.read_csv(BASE + "ts_yearly_all.csv")`}
        />
        <CodeBlock
          label="S3 protocol"
          code={`import boto3, pandas as pd

s3 = boto3.client("s3", endpoint_url="https://t3.storage.dev",
                  region_name="auto")
obj = s3.get_object(Bucket="ontopic-public-data",
                    Key="amazon-reviews/merged_results/"
                        "category_stats_all.csv")
cats = pd.read_csv(obj["Body"])`}
        />
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-hub-ink-faint">
        The bucket answers anonymous GETs on virtual-host style URLs (
        <code className="rounded bg-hub-paper2 px-1 py-0.5 font-plex text-[11.5px]">bucket.t3.storage.dev/key</code>
        ); the path-style form{' '}
        <code className="rounded bg-hub-paper2 px-1 py-0.5 font-plex text-[11.5px]">t3.storage.dev/bucket/key</code>{' '}
        returns 403.
      </p>

      <h3 className="mt-10 font-serif text-[19px] font-semibold text-hub-ink">
        Four ways to get this wrong
      </h3>
      <ol className="mt-4 space-y-3">
        {[
          ['Only ts_yearly is a timeline.', 'The monthly, weekday, and hour files pool every year together. Plotting them left to right as a time axis produces a chart that means nothing.'],
          ['Filter on count before trusting a rate.', 'A category-year holding one review reports rating_5_pct = 100.0. Every rate chart here drops cells under 500 reviews.'],
          ['Volumes span four orders of magnitude.', `${compact(largest.n)} reviews in ${largest.label} against ${int(smallest.n)} in ${smallest.label}. Normalise before you compare.`],
          ['Percent columns are 0–100.', 'Not 0–1. Dividing twice, or not at all, is the most common bug against these files.'],
        ].map(([head, body]) => (
          <li key={head} className="flex gap-3 rounded-lg border border-hub-line bg-hub-paper2/50 px-4 py-3">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-hub-amber" />
            <p className="text-[14px] leading-relaxed text-hub-ink-soft">
              <span className="font-semibold text-hub-ink">{head}</span> {body}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-8 border-t border-hub-line pt-5 text-[13px] leading-relaxed text-hub-ink-faint">
        Derived from{' '}
        <a href={meta.source} className="text-hub-teal underline decoration-hub-teal/40 underline-offset-2">
          McAuley-Lab/Amazon-Reviews-2023
        </a>{' '}
        and inherits its terms. Aggregation ran on Google Cloud Run, one job per category, streaming
        each <code className="font-plex">raw_review_*</code> split; the merged CSVs were migrated to
        Tigris in August 2026 with every object verified by MD5. Charts on these pages read a
        {' '}{meta.categoryCount}-category JSON built from those CSVs by{' '}
        <code className="font-plex text-[12px]">scripts/fetch-amazon-aggregates.mjs</code>.
      </p>
    </Section>
  );
}
