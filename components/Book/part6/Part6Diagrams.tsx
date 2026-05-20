'use client';

import * as React from 'react';

/**
 * Shared visuals for Part VI.
 *
 *   - ArtefactCatalog: complete index of every named artefact in the book.
 *   - PortfolioMonitoring: portfolio-level dashboard mock.
 *   - TwoStudioIntersection: Venn of the customer-intelligence + customer-voice studios.
 *   - DecisionMemoTemplate: a renderable memo template, also used as the sample memo.
 */

const C = {
  ink: '#172033',
  muted: '#64748b',
  grid: '#e2e8f0',
  blue: '#2563eb',
  blueLight: '#dbeafe',
  navy: '#1f3a5f',
  orange: '#c87c2a',
  orangeLight: '#fed7aa',
  green: '#0f766e',
  greenLight: '#ccfbf1',
  red: '#dc2626',
  redLight: '#fee2e2',
  purple: '#7c3aed',
  purpleLight: '#ede9fe',
  amber: '#d97706',
  amberLight: '#fef3c7',
  teal: '#0d9488',
  tealLight: '#a7f3d0',
  pink: '#db2777',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
};

function Card({ title, children, footer }: { title?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      {title && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
      )}
      {children}
      {footer && <div className="mt-2 text-[11px] text-slate-500">{footer}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 23.1 — ArtefactCatalog                                                */
/* ------------------------------------------------------------------ */

export function ArtefactCatalog() {
  const groups = [
    {
      group: 'One-page Cards & Memos',
      color: C.blue,
      items: [
        { name: 'Decision Question Card', where: '§9.1', who: 'Project sponsor + analyst' },
        { name: 'Identification Memo', where: '§11.2', who: 'Analyst + reviewer' },
        { name: 'Predictive Task Contract', where: '§14.2', who: 'Modelling team' },
        { name: 'Model Card', where: '§15.5', who: 'Modelling team + governance' },
        { name: 'AI Workflow Card', where: '§22.1', who: 'AI workflow owner' },
        { name: 'Decision Memo', where: '§24.1', who: 'Sponsor + analyst' },
      ],
    },
    {
      group: 'Studios (capstones)',
      color: C.green,
      items: [
        { name: 'Data Language Studio', where: '§4.1', who: 'Data team' },
        { name: 'Visual Decision Brief Studio', where: '§8.2', who: 'Analyst + executive' },
        { name: 'Pricing & Promotion Studio', where: '§13.4', who: 'Pricing + revenue management' },
        { name: 'Customer Intelligence Studio', where: '§17.4', who: 'Customer analytics' },
        { name: 'Customer Voice Intelligence Studio', where: '§22.2', who: 'Customer insights + ops' },
        { name: 'Final Integrative Case', where: '§25.1', who: 'Executive owner' },
      ],
    },
    {
      group: 'Dashboards & Monitoring',
      color: C.purple,
      items: [
        { name: 'KPI / dashboard storyboard', where: '§8.1', who: 'Analytics + operator' },
        { name: 'Threshold–profit curve', where: '§15.2', who: 'Modelling + finance' },
        { name: 'Model monitoring dashboard', where: '§17.3', who: 'ML operations' },
        { name: 'AI evaluation dashboard', where: '§22.1', who: 'AI governance' },
        { name: 'Portfolio monitoring view', where: '§24.2', who: 'Analytics leadership' },
      ],
    },
    {
      group: 'Case packs (appended)',
      color: C.amber,
      items: [
        { name: 'Soup, Milk, Zillow', where: 'Part III appendix', who: 'Course / self-study' },
        { name: 'BAV, Airbnb', where: 'Part IV appendix', who: 'Course / self-study' },
        { name: 'Yelp, Goose Island, Earnings, Jobs', where: 'Part V appendix', who: 'Course / self-study' },
      ],
    },
  ];
  return (
    <Card title="The artefact catalog — what the book builds, where, and who owns it">
      <div className="space-y-3">
        {groups.map(g => (
          <div key={g.group}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: g.color }} />
              <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: g.color }}>{g.group}</span>
            </div>
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-1.5 text-left">Artefact</th>
                    <th className="px-2 py-1.5 text-left">Where</th>
                    <th className="px-2 py-1.5 text-left">Owner role</th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((it, i) => (
                    <tr key={it.name} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                      <td className="px-2 py-1.5 font-semibold text-slate-800">{it.name}</td>
                      <td className="px-2 py-1.5 font-mono text-slate-600">{it.where}</td>
                      <td className="px-2 py-1.5 italic text-slate-600">{it.who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Every artefact has a home in the book, a named owner role, and an update cadence in §24.2.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 24.2 — PortfolioMonitoring                                            */
/* ------------------------------------------------------------------ */

export function PortfolioMonitoring() {
  const rows = [
    { name: 'Customer Intelligence Studio (§17.4)', kpis: ['AUC 0.83', 'Top-decile lift 3.2×', 'Drift KS 0.04'], status: 'ok' },
    { name: 'Customer Voice Studio (§22.2)', kpis: ['Eval 0.86', 'Refusal 4%', 'Grounding 96%'], status: 'ok' },
    { name: 'Pricing Studio (§13.4)', kpis: ['Elasticity stable', 'Margin +1.2pt', 'Holdout passed'], status: 'ok' },
    { name: 'Visual Decision Briefs (§8.2)', kpis: ['Last refresh: 14d', '3 active briefs', '1 needs review'], status: 'warn' },
    { name: 'Data Quality (§3.2)', kpis: ['Null rate 0.1%', 'Schema drift: 1 alert', 'Owner: data eng'], status: 'warn' },
  ];
  return (
    <Card title="Portfolio monitoring — every studio, every KPI, one screen">
      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <th className="px-2 py-1.5 text-left">Studio / asset</th>
              <th className="px-2 py-1.5 text-left">Headline KPIs</th>
              <th className="px-2 py-1.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                <td className="px-2 py-1.5 font-semibold text-slate-800">{r.name}</td>
                <td className="px-2 py-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {r.kpis.map(k => (
                      <span key={k} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10.5px] text-slate-700">{k}</span>
                    ))}
                  </div>
                </td>
                <td className="px-2 py-1.5 text-right">
                  {r.status === 'ok' ? (
                    <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">healthy</span>
                  ) : (
                    <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">watch</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-[11.5px] text-amber-900">
        <div className="font-semibold">Portfolio alert · Visual Decision Briefs</div>
        Three active briefs older than 14 days. One brief tied to a discontinued campaign. Owner: Analytics Comms. Action: triage and retire by Friday.
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 24.2 — TwoStudioIntersection                                          */
/* ------------------------------------------------------------------ */

export function TwoStudioIntersection() {
  const W = 760;
  const H = 320;
  const r = 130;
  const cy = H / 2;
  const leftCx = W / 2 - 70;
  const rightCx = W / 2 + 70;
  return (
    <Card title="Two studios, one customer — the intersection is where the strongest actions live">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Venn diagram showing the Customer Intelligence Studio and the Customer Voice Intelligence Studio with their intersection.">
        <circle cx={leftCx} cy={cy} r={r} fill={C.blueLight} stroke={C.blue} strokeWidth={1.8} opacity={0.7} />
        <circle cx={rightCx} cy={cy} r={r} fill={C.amberLight} stroke={C.amber} strokeWidth={1.8} opacity={0.7} />
        {/* labels */}
        <text x={leftCx - 60} y={cy - r - 12} textAnchor="middle" className="fill-blue-900 text-[12px] font-semibold">Customer Intelligence (§17.4)</text>
        <text x={leftCx - 60} y={cy - r + 6} textAnchor="middle" className="fill-blue-700 text-[10px] italic">structured data · scores · segments</text>
        <text x={rightCx + 60} y={cy - r - 12} textAnchor="middle" className="fill-amber-900 text-[12px] font-semibold">Customer Voice (§22.2)</text>
        <text x={rightCx + 60} y={cy - r + 6} textAnchor="middle" className="fill-amber-700 text-[10px] italic">unstructured text · constructs · themes</text>
        {/* left-only text */}
        <foreignObject x={leftCx - 160} y={cy - 50} width={120} height={120}>
          <div style={{ fontSize: 10.5, color: '#1e3a8a', lineHeight: 1.3 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Knows:</div>
            <div>• who is at risk</div>
            <div>• who is high value</div>
            <div>• who to target</div>
            <div>• retention threshold</div>
          </div>
        </foreignObject>
        {/* intersection */}
        <foreignObject x={W / 2 - 80} y={cy - 50} width={160} height={120}>
          <div style={{ fontSize: 10.5, color: '#172033', textAlign: 'center', lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700, color: C.green, marginBottom: 4 }}>Intersection</div>
            <div>high-risk customers</div>
            <div>also in emerging</div>
            <div>complaint cluster →</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>highest-leverage action</div>
          </div>
        </foreignObject>
        {/* right-only */}
        <foreignObject x={rightCx + 40} y={cy - 50} width={130} height={120}>
          <div style={{ fontSize: 10.5, color: '#7c2d12', lineHeight: 1.3 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Knows:</div>
            <div>• what they're saying</div>
            <div>• what aspects hurt</div>
            <div>• which themes rising</div>
            <div>• construct severity</div>
          </div>
        </foreignObject>
      </svg>
      <p className="mt-2 text-[11px] text-slate-500">
        The Part IV studio answers <em>who and how loud</em>. The Part V studio answers <em>what and why</em>. The intersection — customers who appear in both — is where retention spend pays off the most.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 24.1 — DecisionMemoTemplate                                            */
/* ------------------------------------------------------------------ */

export interface DecisionMemoTemplateProps {
  /** Render in 'template' mode (empty sections) or 'sample' mode (filled Bean & Basket example). */
  mode?: 'template' | 'sample';
}

export function DecisionMemoTemplate({ mode = 'template' }: DecisionMemoTemplateProps) {
  const template = [
    { section: 'Decision', body: 'The recommendation in one sentence. Name the action, the unit, the horizon.' },
    { section: 'Context', body: 'Why this decision now. The pressure or opportunity that prompted it.' },
    { section: 'Evidence — descriptive', body: 'What the data already shows (Parts I–II). One chart, one number.' },
    { section: 'Evidence — causal', body: 'What we know about cause and effect (Part III). The identification claim.' },
    { section: 'Evidence — predictive', body: 'What we expect to happen (Part IV). The model and its uncertainty.' },
    { section: 'Evidence — AI / unstructured', body: 'What customer or document text adds (Part V). Constructs and grounded answers.' },
    { section: 'Counterfactual', body: 'What happens if we do nothing. Always named.' },
    { section: 'Uncertainty', body: 'Honest assessment of what could be wrong. Sensitivity to assumptions.' },
    { section: 'Recommendation', body: 'The action. The threshold. The named owner.' },
    { section: 'Next test', body: 'What we will measure to know whether the action worked.' },
    { section: 'Open questions', body: 'What this memo did not answer; what the next memo should.' },
  ];
  const sample = [
    { section: 'Decision', body: 'Launch a 60-day retention offer to the top decile of churn-risk customers who also appear in the "app reliability" complaint cluster.' },
    { section: 'Context', body: 'Q2 churn ticked up 1.2 points; app store reviews surfaced a new app-issues cluster in May; we have a credit-based offer designed but never deployed at scale.' },
    { section: 'Evidence — descriptive', body: '90-day churn for active customers was 4.8% (up from 3.6%). Visual: sentiment-by-week chart shows a dip starting May 12.' },
    { section: 'Evidence — causal', body: 'A 2025 retention offer pilot (§12.1 DiD framing) on a similar segment lifted 60-day retention by 2.4 points (95% CI: 1.1–3.7); parallel trends held.' },
    { section: 'Evidence — predictive', body: 'Churn model (§15.1) ranks 18,400 customers in the top decile by 60-day churn probability ≥ 0.42 (the §15.2 profit-maximizing threshold).' },
    { section: 'Evidence — AI / unstructured', body: '3,100 of those customers (17%) appear in the "app reliability" cluster (§19.2). Construct measurement (§19.3) flags 740 as expressing "intent to switch."' },
    { section: 'Counterfactual', body: 'Without intervention: forecast 2,650 churners in this segment over the next 60 days based on the model + cluster trajectory. The retention offer holdout will measure incremental retention vs. this baseline.' },
    { section: 'Uncertainty', body: 'Offer cost assumption holds only if redemption stays under 70%. If app issues persist beyond 30 days, retention lift may degrade — schedule a 30-day check-in.' },
    { section: 'Recommendation', body: 'Approve $42k retention budget; run as a randomized holdout (90% treatment / 10% control); owner: Customer Insights + Retention Marketing; launch July 8.' },
    { section: 'Next test', body: '60-day retention rate vs. holdout; secondary KPI: post-offer NPS and app-issue ticket volume from the targeted segment.' },
    { section: 'Open questions', body: 'Is the app reliability fix tracking? Should we pair this with an in-app credit rather than email? What about the high-value but not-yet-at-risk segment?' },
  ];
  const data = mode === 'sample' ? sample : template;
  return (
    <Card title={mode === 'sample' ? 'Sample memo — Bean & Basket retention decision (July 2026)' : 'The decision memo template — one page, eleven sections'}>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-[12px]">
          <tbody>
            {data.map((r, i) => (
              <tr key={r.section} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                <th className="w-[180px] px-3 py-1.5 text-left align-top font-semibold text-slate-700">{r.section}</th>
                <td className="px-3 py-1.5 text-slate-700">{r.body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        {mode === 'sample'
          ? 'A real memo runs about one page. Every section ties to an artefact produced earlier in the book.'
          : 'Lead with the recommendation. Show one chart, not three. Name the counterfactual, the threshold, and the owner.'}
      </p>
    </Card>
  );
}
