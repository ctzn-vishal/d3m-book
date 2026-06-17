import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { getDataset, getDatasetItems, contentUrl } from '@/lib/gallery';

export const revalidate = 600;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const items = await getDatasetItems();
  return items.map(i => ({ id: i.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const d = await getDataset(id);
  if (!d) return { title: 'Dataset' };
  return { title: `${d.title} — Dataset`, description: d.description };
}

function fmtBytes(b: number | null): string {
  if (!b) return '—';
  if (b > 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  if (b > 1e3) return `${Math.round(b / 1e3)} KB`;
  return `${b} B`;
}
function fmtPct(p: number | null): string {
  if (p == null) return '—';
  if (p === 0) return '0%';
  return p < 0.1 ? '<0.1%' : `${p.toFixed(1)}%`;
}

export default async function DatasetPage({ params }: Props) {
  const { id } = await params;
  const d = await getDataset(id);
  if (!d) notFound();

  return (
    <div>
      <header className="hub-hero border-b border-hub-line">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-7">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-plex text-[11px] uppercase tracking-[0.08em] text-hub-ink-soft hover:text-hub-teal"
          >
            <ArrowLeft size={13} strokeWidth={2.5} /> Gallery
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2 font-plex text-[11px] uppercase tracking-[0.06em] text-hub-ink-faint">
            <span className="text-hub-teal">Dataset</span>
            {d.topic && (<><span>·</span><span>{d.topic}</span></>)}
            <span>·</span>
            <span>{d.format}</span>
          </div>
          <h1 className="mt-2 font-serif text-[clamp(28px,4.6vw,44px)] font-semibold leading-tight tracking-tight text-hub-ink">
            {d.title}
          </h1>
          {d.description && (
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-hub-ink-soft">{d.description}</p>
          )}
          <a
            href={contentUrl(d.file)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-hub-teal px-5 py-2.5 font-plex text-[12px] uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#26605c]"
          >
            <Download size={15} strokeWidth={2.5} /> Download {d.format} · {fmtBytes(d.sizeBytes)}
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-7">
        {/* Key facts */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: 'Rows', v: d.rows?.toLocaleString() ?? '—' },
            { k: 'Columns', v: d.cols?.toLocaleString() ?? '—' },
            { k: 'Format', v: d.format },
            { k: 'Size', v: fmtBytes(d.sizeBytes) },
          ].map(s => (
            <div key={s.k} className="rounded-xl border border-hub-line bg-hub-card p-4 shadow-hub">
              <div className="font-plex text-[10px] uppercase tracking-[0.1em] text-hub-ink-faint">{s.k}</div>
              <div className="mt-1 font-serif text-xl font-semibold text-hub-ink">{s.v}</div>
            </div>
          ))}
        </div>

        {d.grain && (
          <p className="mt-6 text-[14.5px] text-hub-ink-soft">
            <span className="font-plex text-[11px] uppercase tracking-[0.08em] text-hub-ink-faint">Grain</span>
            <br />
            {d.grain}
          </p>
        )}

        {d.useCases.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-lg font-semibold text-hub-ink">Teaching uses</h2>
            <ul className="mt-3 space-y-2">
              {d.useCases.map(u => (
                <li key={u} className="flex gap-2.5 text-[14.5px] leading-relaxed text-hub-ink-soft">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-hub-amber" />
                  {u}
                </li>
              ))}
            </ul>
          </section>
        )}

        {d.columns.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif text-lg font-semibold text-hub-ink">
              Columns <span className="font-plex text-[12px] text-hub-ink-faint">{d.columns.length}</span>
            </h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-hub-line">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-hub-line bg-hub-paper2 font-plex text-[10.5px] uppercase tracking-[0.06em] text-hub-ink-faint">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Null</th>
                    <th className="px-3 py-2 font-medium">Unique</th>
                    <th className="px-3 py-2 font-medium">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {d.columns.map(c => (
                    <tr key={c.name} className="border-b border-hub-line last:border-b-0">
                      <td className="px-3 py-2 font-plex text-[12px] text-hub-ink">{c.name}</td>
                      <td className="px-3 py-2 text-hub-ink-soft">{c.dtype}</td>
                      <td className="px-3 py-2 text-hub-ink-soft tabular-nums">{fmtPct(c.nullPct)}</td>
                      <td className="px-3 py-2 text-hub-ink-soft tabular-nums">{c.unique?.toLocaleString() ?? '—'}</td>
                      <td className="max-w-[18rem] truncate px-3 py-2 text-hub-ink-faint">
                        {c.examples.length ? c.examples.join(', ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {(d.source || d.confidence) && (
          <p className="mt-8 font-plex text-[11px] uppercase tracking-[0.06em] text-hub-ink-faint">
            {d.source && <>Source context: {d.source}</>}
            {d.source && d.confidence && ' · '}
            {d.confidence}
          </p>
        )}
      </div>
    </div>
  );
}
