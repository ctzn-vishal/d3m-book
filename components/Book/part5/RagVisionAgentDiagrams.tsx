'use client';

import * as React from 'react';

/**
 * Conceptual diagrams for Part V Chapters 20 (RAG/Vision/Multimodal) and 21 (LLMs/Agents).
 *
 *   - RagPipeline: docs → chunk → embed → index ← query ← user → retrieve → LLM → answer.
 *   - CnnFeatureHierarchy: edges → textures → parts → objects column.
 *   - VisionPipeline: image → model → labels / boxes / segmentation / embedding.
 *   - DocumentAIFlow: scan → layout → OCR → field extraction → review.
 *   - MultimodalArchitecture: text + image + audio + video → shared space → use cases.
 *   - LlmCapabilityMap: a 2x4 grid of capabilities each with an example.
 *   - PromptStructureCard: a labelled prompt skeleton.
 *   - StructuredOutputFlow: free text → schema → validated JSON.
 *   - AgentWorkflowDiagram: the full agent loop with tools, memory, human gate.
 *   - HumanApprovalGate: schematic showing the decision point.
 *   - CustomerVoiceStudioFlow: end-to-end loop for §22.2 capstone.
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
  pinkLight: '#fce7f3',
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
/* 20.1 — RagPipeline                                                   */
/* ------------------------------------------------------------------ */

export function RagPipeline() {
  const W = 800;
  const H = 320;
  return (
    <Card title="A retrieval-augmented generation pipeline, end to end">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="RAG flow from documents to chunks to embeddings to index, with user query routed through retrieval into the LLM.">
        {/* docs */}
        <g>
          <rect x={20} y={40} width={120} height={70} rx={8} fill={C.amberLight} stroke={C.amber} strokeWidth={1.6} />
          <text x={80} y={64} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">Company docs</text>
          <text x={80} y={80} textAnchor="middle" className="fill-slate-600 text-[10px]">manuals · policies</text>
          <text x={80} y={94} textAnchor="middle" className="fill-slate-600 text-[10px]">FAQs · pricing decks</text>
        </g>
        {/* chunk */}
        <line x1={140} y1={75} x2={170} y2={75} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#rag-arrow)" />
        <g>
          <rect x={170} y={40} width={110} height={70} rx={8} fill="white" stroke={C.amber} strokeWidth={1.6} />
          <text x={225} y={64} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">Chunk</text>
          <text x={225} y={80} textAnchor="middle" className="fill-slate-500 text-[10px]">500–800 tokens</text>
          <text x={225} y={94} textAnchor="middle" className="fill-slate-500 text-[10px]">with overlap</text>
        </g>
        {/* embed */}
        <line x1={280} y1={75} x2={310} y2={75} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#rag-arrow)" />
        <g>
          <rect x={310} y={40} width={110} height={70} rx={8} fill="white" stroke={C.blue} strokeWidth={1.6} />
          <text x={365} y={64} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">Embed</text>
          <text x={365} y={80} textAnchor="middle" className="fill-slate-500 text-[10px]">vector per chunk</text>
        </g>
        {/* index */}
        <line x1={420} y1={75} x2={450} y2={75} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#rag-arrow)" />
        <g>
          <rect x={450} y={40} width={120} height={70} rx={8} fill={C.purpleLight} stroke={C.purple} strokeWidth={1.6} />
          <text x={510} y={64} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">Vector index</text>
          <text x={510} y={80} textAnchor="middle" className="fill-slate-500 text-[10px]">ANN search</text>
        </g>
        {/* user */}
        <g>
          <rect x={20} y={200} width={120} height={70} rx={8} fill={C.tealLight} stroke={C.teal} strokeWidth={1.6} />
          <text x={80} y={224} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">User question</text>
          <text x={80} y={240} textAnchor="middle" className="fill-slate-500 text-[10px]">"What's our refund</text>
          <text x={80} y={252} textAnchor="middle" className="fill-slate-500 text-[10px]">policy for app users?"</text>
        </g>
        {/* embed query */}
        <line x1={140} y1={235} x2={310} y2={235} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#rag-arrow)" />
        <g>
          <rect x={310} y={200} width={110} height={70} rx={8} fill="white" stroke={C.blue} strokeWidth={1.6} />
          <text x={365} y={224} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">Embed query</text>
          <text x={365} y={240} textAnchor="middle" className="fill-slate-500 text-[10px]">same model</text>
        </g>
        {/* retrieve - up arrow to index */}
        <line x1={420} y1={235} x2={510} y2={120} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#rag-arrow)" strokeDasharray="3 3" />
        <text x={465} y={180} textAnchor="middle" className="fill-slate-600 text-[10px] italic">top-k retrieve</text>
        {/* LLM */}
        <line x1={570} y1={75} x2={620} y2={150} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#rag-arrow)" />
        <text x={605} y={108} textAnchor="middle" className="fill-slate-600 text-[10px] italic">retrieved chunks</text>
        <line x1={420} y1={235} x2={620} y2={185} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#rag-arrow)" />
        <text x={520} y={222} textAnchor="middle" className="fill-slate-600 text-[10px] italic">original question</text>
        <g>
          <rect x={620} y={140} width={160} height={70} rx={8} fill={C.greenLight} stroke={C.green} strokeWidth={1.6} />
          <text x={700} y={164} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">LLM</text>
          <text x={700} y={180} textAnchor="middle" className="fill-slate-500 text-[10px]">answer + citations</text>
          <text x={700} y={194} textAnchor="middle" className="fill-slate-500 text-[10px]">from retrieved chunks</text>
        </g>
        {/* answer */}
        <line x1={700} y1={210} x2={700} y2={250} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#rag-arrow)" />
        <g>
          <rect x={620} y={250} width={160} height={50} rx={6} fill="white" stroke={C.ink} strokeWidth={1.4} />
          <text x={700} y={272} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">Answer with sources</text>
          <text x={700} y={288} textAnchor="middle" className="fill-slate-500 text-[10px]">user can audit grounding</text>
        </g>
        <defs>
          <marker id="rag-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>
      </svg>
      <p className="mt-1 text-center text-[11px] text-slate-500">
        The retrieval step is where most RAG failures live. Bad retrieval → ungrounded answer; missing chunk → confident hallucination.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 20.2 — CnnFeatureHierarchy                                            */
/* ------------------------------------------------------------------ */

export function CnnFeatureHierarchy() {
  const W = 760;
  const H = 280;
  const stages = [
    { name: 'Pixels', sub: 'raw image', color: C.muted, ex: '256 × 256 × 3' },
    { name: 'Edges', sub: 'first conv layers', color: C.blue, ex: '/  \\  —  |' },
    { name: 'Textures', sub: 'mid layers', color: C.purple, ex: 'fur · brick · wood' },
    { name: 'Object parts', sub: 'deep layers', color: C.amber, ex: 'wheel · eye · leaf' },
    { name: 'Objects / scenes', sub: 'top layer', color: C.green, ex: 'car · cat · espresso bar' },
  ];
  const cellW = (W - 60) / stages.length;
  const yMid = 140;
  return (
    <Card title="What a CNN actually learns — a hierarchy of visual features">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Five stages from pixels to objects, each one a deeper layer of a CNN.">
        {stages.map((s, i) => {
          const x = 30 + cellW * i;
          return (
            <g key={s.name}>
              <rect x={x + 8} y={yMid - 60} width={cellW - 16} height={120} rx={10} fill="white" stroke={s.color} strokeWidth={1.8} />
              <text x={x + cellW / 2} y={yMid - 36} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold" style={{ fill: s.color }}>{s.name}</text>
              <text x={x + cellW / 2} y={yMid - 20} textAnchor="middle" className="fill-slate-500 text-[10px]">{s.sub}</text>
              <text x={x + cellW / 2} y={yMid + 8} textAnchor="middle" className="fill-slate-700 text-[10px] font-mono">{s.ex}</text>
              <text x={x + cellW / 2} y={yMid + 36} textAnchor="middle" className="fill-slate-400 text-[10px]">layer {i}</text>
              {i < stages.length - 1 && (
                <line x1={x + cellW - 8} y1={yMid} x2={x + cellW + 8} y2={yMid} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#cnn-arrow)" />
              )}
            </g>
          );
        })}
        <defs>
          <marker id="cnn-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>
        <text x={W / 2} y={H - 14} textAnchor="middle" className="fill-slate-500 text-[10px] italic">
          No human told the model what an edge or a wheel was. The layers emerged from training on labelled images.
        </text>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 20.2 — VisionPipeline                                                 */
/* ------------------------------------------------------------------ */

export function VisionPipeline() {
  const W = 760;
  const H = 280;
  return (
    <Card title="Four common output shapes from a vision model">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Vision model fanning out to four output shapes.">
        {/* image */}
        <rect x={30} y={H / 2 - 40} width={130} height={80} rx={8} fill={C.slate100} stroke={C.muted} strokeWidth={1.4} />
        <rect x={50} y={H / 2 - 30} width={90} height={60} rx={4} fill={C.amberLight} stroke={C.amber} strokeWidth={1.2} />
        <text x={95} y={H / 2 + 8} textAnchor="middle" className="fill-slate-700 text-[10.5px]">image</text>
        {/* model */}
        <line x1={160} y1={H / 2} x2={210} y2={H / 2} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#vp-arrow)" />
        <rect x={210} y={H / 2 - 36} width={140} height={72} rx={10} fill={C.purpleLight} stroke={C.purple} strokeWidth={1.8} />
        <text x={280} y={H / 2 - 12} textAnchor="middle" className="fill-purple-900 text-[12px] font-semibold">Vision model</text>
        <text x={280} y={H / 2 + 6} textAnchor="middle" className="fill-purple-700 text-[10px]">CNN or ViT</text>
        <text x={280} y={H / 2 + 22} textAnchor="middle" className="fill-purple-700 text-[10px]">pretrained + fine-tuned</text>
        {/* fan out */}
        {[
          { y: 30, label: 'Class label', sub: '"espresso machine"', color: C.blue, ex: 'classification' },
          { y: 110, label: 'Bounding boxes', sub: '[(x,y,w,h, "cup"), ...]', color: C.green, ex: 'object detection' },
          { y: 190, label: 'Segmentation mask', sub: 'per-pixel class', color: C.teal, ex: 'segmentation' },
          { y: 240, label: 'Image embedding', sub: 'vector for search', color: C.amber, ex: 'similarity' },
        ].map(o => (
          <g key={o.label}>
            <line x1={350} y1={H / 2} x2={420} y2={o.y + 28} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#vp-arrow)" strokeDasharray="3 3" />
            <rect x={420} y={o.y} width={310} height={48} rx={8} fill="white" stroke={o.color} strokeWidth={1.6} />
            <text x={432} y={o.y + 20} className="fill-slate-900 text-[11.5px] font-semibold" style={{ fill: o.color }}>{o.label}</text>
            <text x={432} y={o.y + 36} className="fill-slate-500 text-[10px]">{o.sub}</text>
            <text x={720} y={o.y + 36} textAnchor="end" className="fill-slate-400 text-[9.5px] italic">{o.ex}</text>
          </g>
        ))}
        <defs>
          <marker id="vp-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 20.3 — DocumentAIFlow                                                 */
/* ------------------------------------------------------------------ */

export function DocumentAIFlow() {
  const W = 800;
  const H = 220;
  const stages = [
    { name: 'Scan / PDF', sub: 'invoice or receipt', color: C.amber },
    { name: 'Layout detection', sub: 'find tables, headers, line-items', color: C.blue },
    { name: 'OCR', sub: 'pixels → text', color: C.purple },
    { name: 'LLM extraction', sub: 'apply JSON schema', color: C.green },
    { name: 'Human review', sub: 'spot-check low-confidence', color: C.red },
    { name: 'Downstream system', sub: 'GL, ERP, CRM', color: C.teal },
  ];
  const cellW = (W - 60) / stages.length;
  const yMid = 110;
  return (
    <Card title="Document AI — what happens between a scanned invoice and a GL entry">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Six-stage document AI pipeline from scan to downstream system.">
        {stages.map((s, i) => {
          const x = 30 + cellW * i;
          return (
            <g key={s.name}>
              <rect x={x + 6} y={yMid - 40} width={cellW - 12} height={80} rx={8} fill="white" stroke={s.color} strokeWidth={1.7} />
              <text x={x + cellW / 2} y={yMid - 14} textAnchor="middle" className="fill-slate-900 text-[11.5px] font-semibold" style={{ fill: s.color }}>{s.name}</text>
              <text x={x + cellW / 2} y={yMid + 4} textAnchor="middle" className="fill-slate-500 text-[10px]">{s.sub}</text>
              <text x={x + cellW / 2} y={yMid + 22} textAnchor="middle" className="fill-slate-400 text-[10px] font-mono">{i + 1}</text>
              {i < stages.length - 1 && (
                <line x1={x + cellW - 6} y1={yMid} x2={x + cellW + 6} y2={yMid} stroke={C.muted} strokeWidth={1.4} markerEnd="url(#daf-arrow)" />
              )}
            </g>
          );
        })}
        <defs>
          <marker id="daf-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>
        <text x={W / 2} y={H - 10} textAnchor="middle" className="fill-slate-500 text-[10px] italic">
          Most of the engineering is in stage 2 (layout) and stage 5 (knowing what to send to a human).
        </text>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 20.4 — MultimodalArchitecture                                         */
/* ------------------------------------------------------------------ */

export function MultimodalArchitecture() {
  const W = 760;
  const H = 320;
  const inputs = [
    { y: 30, name: 'Text', sub: 'reviews, tickets, docs', color: C.blue },
    { y: 95, name: 'Image', sub: 'shelf, product, ad', color: C.green },
    { y: 160, name: 'Audio', sub: 'sales call, podcast', color: C.purple },
    { y: 225, name: 'Video', sub: 'in-store, ad spot', color: C.red },
  ];
  const cx = W / 2;
  return (
    <Card title="A multimodal model — different inputs, one shared meaning space, many use cases">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Four input modalities feeding a shared embedding space and fanning out to use cases.">
        {inputs.map(inp => (
          <g key={inp.name}>
            <rect x={20} y={inp.y} width={150} height={48} rx={8} fill="white" stroke={inp.color} strokeWidth={1.6} />
            <text x={95} y={inp.y + 20} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold" style={{ fill: inp.color }}>{inp.name}</text>
            <text x={95} y={inp.y + 36} textAnchor="middle" className="fill-slate-500 text-[10px]">{inp.sub}</text>
            <line x1={170} y1={inp.y + 24} x2={cx - 80} y2={H / 2 - 10 + (inp.y - 130) * 0.1} stroke={C.muted} strokeWidth={1.4} markerEnd="url(#mm-arrow)" />
          </g>
        ))}
        {/* shared space */}
        <rect x={cx - 80} y={H / 2 - 60} width={160} height={120} rx={12} fill={C.slate100} stroke={C.ink} strokeWidth={1.6} />
        <text x={cx} y={H / 2 - 32} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">Shared embedding space</text>
        <text x={cx} y={H / 2 - 12} textAnchor="middle" className="fill-slate-500 text-[10px]">text + image + audio + video</text>
        <text x={cx} y={H / 2 + 8} textAnchor="middle" className="fill-slate-500 text-[10px]">in the same coordinates</text>
        {/* shared examples icons */}
        {['T', 'I', 'A', 'V'].map((l, i) => (
          <g key={l}>
            <circle cx={cx - 50 + i * 30} cy={H / 2 + 36} r={10} fill="white" stroke={C.muted} strokeWidth={1.2} />
            <text x={cx - 50 + i * 30} y={H / 2 + 40} textAnchor="middle" className="fill-slate-700 text-[10px] font-semibold">{l}</text>
          </g>
        ))}
        {/* outputs */}
        {[
          { y: 30, label: 'Product image search', sub: '"dark espresso mugs"' },
          { y: 95, label: 'Caption generation', sub: 'image → alt-text' },
          { y: 160, label: 'Sales-call coaching', sub: 'audio → summary' },
          { y: 225, label: 'Shelf monitoring', sub: 'video → KPI' },
        ].map(o => (
          <g key={o.label}>
            <line x1={cx + 80} y1={H / 2 - 10 + (o.y - 130) * 0.1} x2={W - 170} y2={o.y + 24} stroke={C.muted} strokeWidth={1.4} markerEnd="url(#mm-arrow)" />
            <rect x={W - 170} y={o.y} width={150} height={48} rx={8} fill={C.amberLight} stroke={C.amber} strokeWidth={1.4} />
            <text x={W - 95} y={o.y + 20} textAnchor="middle" className="fill-slate-900 text-[11px] font-semibold">{o.label}</text>
            <text x={W - 95} y={o.y + 36} textAnchor="middle" className="fill-slate-500 text-[10px] italic">{o.sub}</text>
          </g>
        ))}
        <defs>
          <marker id="mm-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 21.1 — LlmCapabilityMap                                               */
/* ------------------------------------------------------------------ */

export function LlmCapabilityMap() {
  const cells = [
    { name: 'Summarize', ex: '"summarize this 40-page contract"', color: C.blue },
    { name: 'Classify', ex: '"this ticket → billing"', color: C.green },
    { name: 'Extract', ex: '"pull renewal date, parties"', color: C.purple },
    { name: 'Translate', ex: '"render in French"', color: C.teal },
    { name: 'Draft', ex: '"reply to this customer"', color: C.amber },
    { name: 'Q&A', ex: '"answer using these docs"', color: C.orange },
    { name: 'Reason / plan', ex: '"propose next test"', color: C.pink },
    { name: 'Narrate', ex: '"explain this chart"', color: C.red },
  ];
  return (
    <Card title="LLMs are language interfaces for workflows — eight capabilities, one substrate">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {cells.map(c => (
          <div key={c.name} className="rounded-md border border-slate-200 p-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
              <span className="text-[12px] font-semibold text-slate-800">{c.name}</span>
            </div>
            <div className="mt-1 text-[10.5px] italic text-slate-500">{c.ex}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        None of these are chatbot moves. They are tasks a manager would have given to an analyst — now available as an API call.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 21.2 — PromptStructureCard                                            */
/* ------------------------------------------------------------------ */

export function PromptStructureCard() {
  const slots = [
    { name: 'Role', body: 'You are a customer insights analyst at a specialty coffee chain.', color: C.blue },
    { name: 'Task', body: 'Summarize the main complaints in the following twenty reviews.', color: C.green },
    { name: 'Context', body: 'Reviews are from the iOS app, May 2026, after a checkout outage on May 12.', color: C.amber },
    { name: 'Constraints', body: 'Separate product, service, app, and pricing issues. Ignore non-English text. Flag any single review verbatim if it threatens regulatory action.', color: C.red },
    { name: 'Examples', body: 'Two labelled example reviews with their target output (omitted here for brevity).', color: C.purple },
    { name: 'Output format', body: 'Return JSON: { topic, evidence_quotes, severity (1–5), suggested_action }.', color: C.teal },
  ];
  return (
    <Card title="A prompt is a structured task brief — same fields a manager would give an analyst">
      <div className="grid grid-cols-1 gap-2">
        {slots.map(s => (
          <div key={s.name} className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 rounded-md border border-slate-200 p-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: s.color }}>{s.name}</div>
            <div className="text-[12px] text-slate-700">{s.body}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Be clear about <em>what</em> you want — the GABRIEL paper shows wording matters less than people fear, once the construct is unambiguous.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 21.3 — StructuredOutputFlow                                           */
/* ------------------------------------------------------------------ */

export function StructuredOutputFlow() {
  const W = 760;
  const H = 240;
  return (
    <Card title="From messy text to validated JSON — the structured-output handoff">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Free-text input flows through LLM with schema into validated JSON used downstream.">
        {/* input */}
        <rect x={20} y={50} width={170} height={140} rx={10} fill={C.amberLight} stroke={C.amber} strokeWidth={1.6} />
        <text x={105} y={74} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">Free-text input</text>
        <foreignObject x={28} y={84} width={154} height={100}>
          <div style={{ fontFamily: 'inherit', fontSize: 10.5, color: '#475569', fontStyle: 'italic', lineHeight: 1.3 }}>
            "Customer is upset — our contract renewed Aug 14 at $12k but the rep promised $9k. They're considering switching."
          </div>
        </foreignObject>
        {/* arrow */}
        <line x1={190} y1={120} x2={250} y2={120} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#sof-arrow)" />
        {/* LLM + schema */}
        <rect x={250} y={50} width={200} height={140} rx={10} fill={C.purpleLight} stroke={C.purple} strokeWidth={1.6} />
        <text x={350} y={74} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">LLM + schema</text>
        <text x={350} y={94} textAnchor="middle" className="fill-slate-500 text-[10px]">JSON mode / instructor</text>
        <foreignObject x={258} y={104} width={184} height={80}>
          <div style={{ fontFamily: 'monospace', fontSize: 9.5, color: '#475569', lineHeight: 1.3 }}>
            {`{
  renewal_date: date,
  amount_usd: number,
  promised_amount: number?,
  intent_to_switch: bool,
  severity: enum
}`}
          </div>
        </foreignObject>
        {/* arrow */}
        <line x1={450} y1={120} x2={510} y2={120} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#sof-arrow)" />
        {/* JSON */}
        <rect x={510} y={50} width={230} height={140} rx={10} fill={C.greenLight} stroke={C.green} strokeWidth={1.6} />
        <text x={625} y={74} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">Validated JSON</text>
        <foreignObject x={518} y={84} width={214} height={100}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#064e3b', lineHeight: 1.4 }}>
            {`{
  "renewal_date": "2026-08-14",
  "amount_usd": 12000,
  "promised_amount": 9000,
  "intent_to_switch": true,
  "severity": "high"
}`}
          </div>
        </foreignObject>
        <text x={W / 2} y={H - 14} textAnchor="middle" className="fill-slate-500 text-[10px] italic">
          The schema is the contract. Output that doesn't validate gets rejected and retried — not silently passed downstream.
        </text>
        <defs>
          <marker id="sof-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 21.4 — AgentWorkflowDiagram                                           */
/* ------------------------------------------------------------------ */

export function AgentWorkflowDiagram() {
  const W = 800;
  const H = 360;
  return (
    <Card title="A customer-insights agent — LLM + tools + memory + a control loop">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="An eight-stage agent workflow with a human-approval gate before Slack alert.">
        {/* control loop background */}
        <rect x={20} y={30} width={W - 40} height={H - 60} rx={14} fill={C.slate50} stroke={C.grid} strokeWidth={1.4} strokeDasharray="6 5" />
        <text x={40} y={50} className="fill-slate-500 text-[10px] uppercase tracking-wide">control loop</text>
        {[
          { x: 60, y: 90, label: '1. Pull reviews', sub: 'tool: warehouse', color: C.blue },
          { x: 220, y: 90, label: '2. Classify', sub: '§18.4 model', color: C.blue },
          { x: 380, y: 90, label: '3. Embed + cluster', sub: '§19.2', color: C.purple },
          { x: 540, y: 90, label: '4. Detect emerging', sub: 'topic delta', color: C.purple },
          { x: 60, y: 210, label: '5. Retrieve tickets', sub: 'RAG (§20.1)', color: C.teal },
          { x: 220, y: 210, label: '6. Summarize', sub: 'LLM + schema', color: C.green },
          { x: 380, y: 210, label: '7. Human review', sub: 'approval gate', color: C.red },
          { x: 540, y: 210, label: '8. Send alert + log', sub: 'tool: Slack + DB', color: C.amber },
        ].map((s) => {
          const isGate = s.label.includes('Human');
          return (
            <g key={s.label}>
              <rect x={s.x} y={s.y} width={140} height={60} rx={8} fill="white" stroke={s.color} strokeWidth={isGate ? 2.5 : 1.6} />
              <text x={s.x + 70} y={s.y + 22} textAnchor="middle" className="fill-slate-900 text-[11px] font-semibold" style={{ fill: s.color }}>{s.label}</text>
              <text x={s.x + 70} y={s.y + 38} textAnchor="middle" className="fill-slate-500 text-[10px]">{s.sub}</text>
              {isGate && (
                <text x={s.x + 70} y={s.y + 52} textAnchor="middle" className="fill-rose-700 text-[9px] font-semibold uppercase tracking-wide">human gate</text>
              )}
            </g>
          );
        })}
        {/* arrows row 1 */}
        <line x1={200} y1={120} x2={220} y2={120} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#agent-arrow)" />
        <line x1={360} y1={120} x2={380} y2={120} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#agent-arrow)" />
        <line x1={520} y1={120} x2={540} y2={120} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#agent-arrow)" />
        {/* row turn */}
        <path d={`M 610 150 Q 700 180 130 200`} fill="none" stroke={C.muted} strokeWidth={1.5} markerEnd="url(#agent-arrow)" strokeDasharray="4 3" />
        {/* arrows row 2 */}
        <line x1={200} y1={240} x2={220} y2={240} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#agent-arrow)" />
        <line x1={360} y1={240} x2={380} y2={240} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#agent-arrow)" />
        <line x1={520} y1={240} x2={540} y2={240} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#agent-arrow)" />
        {/* feedback */}
        <path d={`M 610 270 Q 730 320 60 320 Q 30 200 60 130`} fill="none" stroke={C.amber} strokeWidth={1.5} markerEnd="url(#agent-arrow-amber)" strokeDasharray="6 4" />
        <text x={W / 2} y={H - 14} textAnchor="middle" className="fill-amber-700 text-[10px] italic">feedback loop — what the agent did becomes signal for next run</text>
        <defs>
          <marker id="agent-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
          <marker id="agent-arrow-amber" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.amber} />
          </marker>
        </defs>
      </svg>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 21.4 — HumanApprovalGate                                               */
/* ------------------------------------------------------------------ */

export function HumanApprovalGate() {
  const W = 720;
  const H = 220;
  return (
    <Card title="The human-approval gate — three states, one decision point">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="An approval gate with three branches: approve, edit-and-approve, or reject.">
        {/* incoming */}
        <rect x={30} y={H / 2 - 30} width={170} height={60} rx={8} fill={C.amberLight} stroke={C.amber} strokeWidth={1.6} />
        <text x={115} y={H / 2 - 8} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold">Agent proposal</text>
        <text x={115} y={H / 2 + 10} textAnchor="middle" className="fill-slate-500 text-[10px]">"Send this Slack alert"</text>
        {/* gate */}
        <line x1={200} y1={H / 2} x2={250} y2={H / 2} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#hag-arrow)" />
        <polygon points={`260,${H / 2 - 40} 360,${H / 2} 260,${H / 2 + 40} 220,${H / 2}`} fill={C.redLight} stroke={C.red} strokeWidth={1.8} />
        <text x={290} y={H / 2 + 4} textAnchor="middle" className="fill-rose-900 text-[12px] font-semibold">Human</text>
        <text x={290} y={H / 2 + 20} textAnchor="middle" className="fill-rose-700 text-[10px]">reviews</text>
        {/* branches */}
        {[
          { y: 30, label: 'Approve', sub: 'sent verbatim', color: C.green },
          { y: H / 2 - 30, label: 'Edit + approve', sub: 'sent with edits', color: C.blue },
          { y: H - 90, label: 'Reject', sub: 'logged, no send', color: C.red },
        ].map(b => (
          <g key={b.label}>
            <line x1={360} y1={H / 2} x2={520} y2={b.y + 30} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#hag-arrow)" />
            <rect x={520} y={b.y} width={160} height={60} rx={8} fill="white" stroke={b.color} strokeWidth={1.6} />
            <text x={600} y={b.y + 24} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold" style={{ fill: b.color }}>{b.label}</text>
            <text x={600} y={b.y + 42} textAnchor="middle" className="fill-slate-500 text-[10px]">{b.sub}</text>
          </g>
        ))}
        <defs>
          <marker id="hag-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
        </defs>
      </svg>
      <p className="mt-1 text-center text-[11px] text-slate-500">
        Every approved or edited decision goes into the training data for the next iteration.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 22.2 — CustomerVoiceStudioFlow                                         */
/* ------------------------------------------------------------------ */

export function CustomerVoiceStudioFlow() {
  const W = 800;
  const H = 240;
  const cells = [
    { label: 'Classify', sub: 'route + tag (§18.4)', color: C.blue },
    { label: 'Measure', sub: 'constructs (§19.3)', color: C.purple },
    { label: 'Cluster', sub: 'embed (§19.2)', color: C.teal },
    { label: 'Retrieve', sub: 'RAG (§20.1)', color: C.amber },
    { label: 'Summarize + act', sub: 'agent (§21.4)', color: C.green },
    { label: 'Monitor', sub: 'governance (§22.1)', color: C.red },
  ];
  const cellW = (W - 60) / cells.length;
  return (
    <Card title="The Part V loop end to end — Customer Voice Intelligence Studio">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Six-stage customer voice studio loop with feedback to monitoring.">
        {cells.map((c, i) => {
          const x = 30 + cellW * i;
          return (
            <g key={c.label}>
              <rect x={x + 10} y={60} width={cellW - 20} height={80} rx={10} fill="white" stroke={c.color} strokeWidth={1.8} />
              <text x={x + cellW / 2} y={92} textAnchor="middle" className="fill-slate-900 text-[13px] font-semibold" style={{ fill: c.color }}>{c.label}</text>
              <text x={x + cellW / 2} y={114} textAnchor="middle" className="fill-slate-500 text-[10px]">{c.sub}</text>
              {i < cells.length - 1 && (
                <line x1={x + cellW - 10} y1={100} x2={x + cellW + 10} y2={100} stroke={C.muted} strokeWidth={1.5} markerEnd="url(#cvs-arrow)" />
              )}
            </g>
          );
        })}
        <defs>
          <marker id="cvs-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.muted} />
          </marker>
          <marker id="cvs-feedback" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={C.amber} />
          </marker>
        </defs>
        <path d={`M ${30 + cellW * (cells.length - 0.5)} 150 C ${30 + cellW * (cells.length - 0.5)} 200 ${30 + cellW * 0.5} 200 ${30 + cellW * 0.5} 150`} fill="none" stroke={C.amber} strokeWidth={1.5} strokeDasharray="6 4" markerEnd="url(#cvs-feedback)" />
        <text x={W / 2} y={224} textAnchor="middle" className="fill-amber-700 text-[10px] italic">monitoring → revised classify / measure / cluster definitions next cycle</text>
      </svg>
    </Card>
  );
}
