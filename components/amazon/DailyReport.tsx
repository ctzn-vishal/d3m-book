'use client';

import * as React from 'react';
import * as Plot from '@observablehq/plot';
import { PlotFigure } from '@/components/Book/charts/PlotFigure';
import { ChartCard, Aside, Section, Warning, plotStyle } from './ui';
import { ACCENT, GRID, MUTED, compact, int, pct } from './types';
import type { Daily } from './phase2-types';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const dt = (s: string) => new Date(`${s}T00:00:00Z`);
const pretty = (s: string) =>
  dt(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/**
 * /amazon/daily — the full daily series. Its absence from the category summaries
 * is why nothing on this site could previously answer "what happened on a
 * specific day".
 */
export function DailyReport({ data }: { data: Daily }) {
  return (
    <>
      <TheWholeSeries data={data} />
      <TheBiggestDays data={data} />
      <TheAnnualShape data={data} />
    </>
  );
}

function TheWholeSeries({ data }: { data: Daily }) {
  const w = data.weekly;
  const peak = w.reduce((a, b) => (b.n > a.n ? b : a));
  const maskedPct = (100 * data.coverage.maskedCategoryDays) / data.coverage.totalCategoryDays;

  return (
    <Section
      eyebrow="The series"
      title={`${int(data.coverage.days)} days with at least one review`}
      lede={
        <>
          The earlier aggregates gave yearly totals and pooled cyclical profiles but never a date
          axis, so no question about a specific day could be asked at all. This is the whole thing,
          from{' '}
          {pretty(data.coverage.from)} to {pretty(data.coverage.to)}, aggregated to weeks so 28 years
          fit in one chart. The busiest week began {pretty(peak.d)} with {compact(peak.n)} reviews.
        </>
      }
    >
      <ChartCard
        title="Reviews per week, 1996–2023"
        subtitle="Weekly totals across all 33 categories. The final week is partial."
      >
        <PlotFigure
          ariaLabel="Area chart of weekly review volume from 1996 to 2023."
          options={width =>
            ({
              width,
              height: 300,
              marginLeft: 60,
              marginBottom: 40,
              marginRight: 14,
              style: plotStyle,
              x: { label: null, type: 'utc' },
              y: { label: '↑ Reviews per week', grid: true, tickFormat: (d: number) => compact(d) },
              marks: [
                Plot.areaY(w, {
                  x: (d: (typeof w)[number]) => dt(d.d),
                  y: 'n',
                  fill: ACCENT.blue,
                  fillOpacity: 0.16,
                  curve: 'step',
                }),
                Plot.line(w, {
                  x: (d: (typeof w)[number]) => dt(d.d),
                  y: 'n',
                  stroke: ACCENT.blue,
                  strokeWidth: 1.2,
                  curve: 'step',
                }),
                Plot.ruleY([0], { stroke: GRID }),
                Plot.tip(
                  w,
                  Plot.pointerX({
                    x: (d: (typeof w)[number]) => dt(d.d),
                    y: 'n',
                    title: (d: (typeof w)[number]) =>
                      `week of ${pretty(d.d)}\n${int(d.n)} reviews\n${d.r != null ? `${d.r.toFixed(2)}★ mean` : 'rating masked'}`,
                  })
                ),
              ],
            }) as PlotOptions
          }
        />
      </ChartCard>

      <Warning label="The rating series is only 61% covered.">
        <code className="font-plex text-[12.5px]">ts_daily_all</code> masks{' '}
        <code className="font-plex text-[12.5px]">avg_rating</code> on thin category-days rather than
        dropping the row — a deliberate deviation from the suppression rule, and it affects{' '}
        {pct(maskedPct)} of the {int(data.coverage.totalCategoryDays)} category-day cells. Daily{' '}
        <em>counts</em> are complete; daily <em>ratings</em> are computed only from the cells that
        report one, which skews toward high-volume category-days. Read the count series freely and the
        rating series carefully.
      </Warning>
    </Section>
  );
}

function TheBiggestDays({ data }: { data: Daily }) {
  const top = data.top;
  const jan = top.filter(t => t.d.slice(5, 7) === '01').length;
  const dec = top.filter(t => t.d.slice(5, 7) === '12').length;
  const rows = top.slice(0, 15).map(t => ({ ...t, dow: dt(t.d).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }) }));

  return (
    <Section
      eyebrow="The peaks"
      title="Amazon’s biggest review days are in January"
      lede={
        <>
          Not Prime Day. Not Black Friday. Not Cyber Monday. Of the 25 highest-volume days since 2010,{' '}
          {jan} fall in January and {dec} in December — the review wave arrives when the gift is
          opened and used, not when it is bought. The single busiest day in the corpus is{' '}
          {pretty(top[0].d)} with {compact(top[0].n)} reviews.
        </>
      }
    >
      <ChartCard
        title="The 15 biggest review days since 2010"
        subtitle="Daily totals across all categories."
      >
        <PlotFigure
          ariaLabel="Bar chart of the biggest review days."
          options={width =>
            ({
              width,
              height: 460,
              marginLeft: width < 560 ? 118 : 152,
              marginRight: 56,
              marginBottom: 40,
              style: plotStyle,
              x: { label: 'Reviews that day →', grid: true, tickFormat: (d: number) => compact(d) },
              y: { label: null, domain: rows.map(r => r.d) },
              marks: [
                Plot.barX(rows, {
                  x: 'n',
                  y: 'd',
                  fill: (d: (typeof rows)[number]) =>
                    d.d.slice(5, 7) === '01' ? ACCENT.amber : d.d.slice(5, 7) === '12' ? ACCENT.plum : ACCENT.blue,
                  fillOpacity: 0.85,
                  tip: true,
                  title: (d: (typeof rows)[number]) =>
                    `${pretty(d.d)}\n${int(d.n)} reviews\n${d.r != null ? `${d.r.toFixed(2)}★ mean` : 'rating masked'}`,
                }),
                Plot.text(rows, {
                  x: 'n',
                  y: 'd',
                  text: (d: (typeof rows)[number]) => `${compact(d.n)} · ${d.dow}`,
                  dx: 6,
                  textAnchor: 'start',
                  fontSize: 10,
                  fill: MUTED,
                }),
                Plot.ruleX([0], { stroke: GRID }),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] text-hub-ink-faint">
          Amber is January, plum December, blue everything else.
        </p>
      </ChartCard>

      <Aside>
        This is the seasonality analysis&rsquo;s conclusion arriving from a completely different
        direction. That page inferred a gift cycle from pooled monthly shares; this one finds it in
        raw daily counts, without any pooling at all. When two independent reductions of the same
        corpus agree, the finding is usually about the world rather than the method.
      </Aside>
    </Section>
  );
}

function TheAnnualShape({ data }: { data: Daily }) {
  const doy = data.doy.filter(d => d.md !== '02-29');
  const peak = doy.reduce((a, b) => (b.idx > a.idx ? b : a));
  const trough = doy.reduce((a, b) => (b.idx < a.idx ? b : a));
  const asDate = (md: string) => dt(`2021-${md}`);
  const label = (md: string) => `${MONTHS[Number(md.slice(0, 2)) - 1]} ${Number(md.slice(3))}`;

  return (
    <Section
      eyebrow="The annual cycle"
      title="One year, day by day"
      lede={
        <>
          Every calendar day, indexed so 100 is that year&rsquo;s average day, averaged over 2015–2022
          so the growth trend is removed. The peak is {label(peak.md)} at {peak.idx.toFixed(0)} and the
          floor is {label(trough.md)} at {trough.idx.toFixed(0)} — a{' '}
          {(peak.idx / trough.idx).toFixed(1)}× swing within a single year, invisible in monthly
          aggregates.
        </>
      }
    >
      <ChartCard
        title="Day-of-year profile, indexed"
        subtitle="100 = the average day of that year. Averaged across 2015–2022."
      >
        <PlotFigure
          ariaLabel="Line chart of indexed review volume by day of year."
          options={width =>
            ({
              width,
              height: 300,
              marginLeft: 52,
              marginBottom: 42,
              marginRight: 14,
              style: plotStyle,
              x: {
                label: null,
                type: 'utc',
                ticks: MONTHS.map((_, i) => dt(`2021-${String(i + 1).padStart(2, '0')}-01`)),
                tickFormat: (d: Date) => MONTHS[d.getUTCMonth()],
              },
              y: { label: '↑ Index (100 = average day)', grid: true },
              marks: [
                Plot.ruleY([100], { stroke: MUTED, strokeDasharray: '3,3' }),
                Plot.line(doy, {
                  x: (d: (typeof doy)[number]) => asDate(d.md),
                  y: 'idx',
                  stroke: ACCENT.teal,
                  strokeWidth: 1.4,
                }),
                Plot.tip(
                  doy,
                  Plot.pointerX({
                    x: (d: (typeof doy)[number]) => asDate(d.md),
                    y: 'idx',
                    title: (d: (typeof doy)[number]) => `${label(d.md)}\nindex ${d.idx.toFixed(0)}`,
                  })
                ),
              ],
            }) as PlotOptions
          }
        />
        <p className="mt-2 text-[12px] leading-snug text-hub-ink-faint">
          The sawtooth is the weekday cycle, which does not align to calendar dates across years and
          so partially averages out. The step down at the end of December and the cliff in early
          January are the gift wave beginning and the backlog clearing.
        </p>
      </ChartCard>
    </Section>
  );
}
