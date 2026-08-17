'use client';

import * as React from 'react';

import {
  Connector,
  DiagramFrame,
  DiagramSvg,
  EyebrowLabel,
  Lane,
  Layers,
  Legend,
  Node,
  PathConnector,
  S,
  SvgText,
  T,
  TreeBus,
  Zone,
  centeredRow,
} from '@/components/Book/diagram';

/**
 * Part V's AI visuals — retrieval, vision, prompting, structured output, and
 * the agent loop.
 *
 *   - RagPipeline           swimlane      index-time and query-time as two lanes
 *   - RagRetrievalDetail    data flow     the retrieval step, on its own
 *   - CnnFeatureHierarchy   layer stack   pixels to objects
 *   - VisionPipeline        data flow     one model, four output shapes
 *   - DocumentAIFlow        process       scan to GL entry
 *   - MultimodalArchitecture architecture encoders, shared space, tasks
 *   - LlmCapabilityMap      cards         eight capabilities
 *   - PromptStructureCard   nested        the six slots of a task brief
 *   - StructuredOutputFlow  state machine parse, validate, retry, accept
 *   - AgentWorkflowDiagram  process+loop  the customer-insights agent
 *   - HumanApprovalGate     flowchart     three states, one decision point
 *   - CustomerVoiceStudioFlow process     the Part V loop end to end
 *
 * This file had six `foreignObject` uses and four diagonal connectors, and was
 * the worst offender in the book on both counts. Both are gone.
 */

/* ------------------------------------------------------------------ */
/* 20.1 — RagPipeline (overview)                                        */
/* ------------------------------------------------------------------ */

const INDEX_TIME = [
  { label: 'Documents', sub: 'PDFs, tickets, wiki', variant: 'input' as const },
  { label: 'Chunk', sub: 'split with overlap', variant: 'step' as const },
  { label: 'Embed', sub: 'text becomes vectors', variant: 'step' as const },
  { label: 'Vector index', sub: 'stored once, reused', variant: 'store' as const },
];

const QUERY_TIME = [
  { label: 'Question', sub: 'from a person or an agent', variant: 'input' as const },
  { label: 'Retrieve', sub: 'top-k nearest chunks', variant: 'focal' as const },
  { label: 'Compose prompt', sub: 'question plus chunks', variant: 'step' as const },
  { label: 'Grounded answer', sub: 'with citations', variant: 'step' as const },
];

/**
 * Split into two lanes, because the single 800x320 figure this replaces was
 * trying to carry indexing, retrieval, and generation at once — over the
 * nine-node budget, which is why its connectors collided and why one of them
 * ran diagonally under its own label.
 *
 * The lanes are the fix and also the lesson: indexing happens once, ahead of
 * time; retrieval happens on every question. Readers who think RAG is slow
 * usually have those two collapsed in their heads.
 *
 * The retrieval step is the only focal node, and it gets its own figure below.
 */
export function RagPipeline() {
  const W = 792;
  const laneH = 112;
  const laneGap = 24;
  const gutter = 104;
  const top = 24;
  const H = top + laneH * 2 + laneGap + 64;
  const boxW = 144;
  const boxH = 64;
  const boxXs = centeredRow(gutter, W - gutter - 16, 4, boxW, 24);

  const laneY = [top, top + laneH + laneGap];

  return (
    <DiagramFrame
      eyebrow="Retrieval-augmented generation"
      note="Indexing happens once, ahead of time; retrieval happens on every question. Collapsing the two is the most common misreading of RAG — and the reason people expect it to be slower than it is."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Retrieval-augmented generation, in two phases"
        desc="At index time, documents are chunked, embedded, and stored in a vector index — done once. At query time, a question retrieves the nearest chunks from that index, those chunks are composed into a prompt, and the model answers with citations."
      >
        <Lane
          x={0}
          y={laneY[0]}
          width={W - 16}
          height={laneH}
          gutter={gutter}
          label="Index time"
          sublabel="once, ahead"
        />
        <Lane
          x={0}
          y={laneY[1]}
          width={W - 16}
          height={laneH}
          gutter={gutter}
          label="Query time"
          sublabel="every question"
        />

        {[INDEX_TIME, QUERY_TIME].map((lane, li) =>
          lane.slice(0, -1).map((step, i) => (
            <Connector
              key={`${li}-${step.label}`}
              from={[boxXs[i] + boxW, laneY[li] + laneH / 2]}
              to={[boxXs[i + 1], laneY[li] + laneH / 2]}
              route="straight"
            />
          ))
        )}

        {/* The one edge that crosses lanes: the index built above is what the
            retrieval below reads. Dashed, because it is a lookup rather than a
            step in either sequence. */}
        <Connector
          from={[boxXs[3] + boxW / 2, laneY[0] + laneH / 2 + boxH / 2]}
          to={[boxXs[1] + boxW / 2, laneY[1] + laneH / 2 - boxH / 2]}
          route="vhv"
          mid={laneY[0] + laneH + laneGap / 2}
          tone="accent"
          dashed
          label="READS THE INDEX"
        />

        {[INDEX_TIME, QUERY_TIME].map((lane, li) =>
          lane.map((step, i) => (
            <Node
              key={`${li}-${step.label}`}
              x={boxXs[i]}
              y={laneY[li] + laneH / 2 - boxH / 2}
              width={boxW}
              height={boxH}
              variant={step.variant}
              label={step.label}
              sublabel={step.sub}
            />
          ))
        )}

        <Legend
          y={H - 12}
          width={W}
          x={16}
          items={[
            { kind: 'focal', label: 'Where most RAG failures live' },
            { kind: 'store', label: 'Built once, read many times' },
          ]}
          pitch={320}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 20.1 — RagRetrievalDetail                                            */
/* ------------------------------------------------------------------ */

const RETRIEVAL_STEPS = [
  { label: 'Question', sub: 'natural language', variant: 'input' as const },
  { label: 'Embed', sub: 'same model as indexing', variant: 'step' as const },
  { label: 'Nearest k', sub: 'cosine similarity', variant: 'step' as const },
  { label: 'Rerank', sub: 'cross-encoder, optional', variant: 'optional' as const },
  { label: 'Context window', sub: 'what the model actually sees', variant: 'focal' as const },
];

/**
 * The detail half of the split. Everything the overview compresses into one
 * box labelled "retrieve".
 *
 * It earns its own figure because it is where the failures are: the wrong
 * embedding model, too small a k, no reranking, or a context window that
 * silently drops the chunk containing the answer. Each of those is invisible
 * in the overview and each produces the same symptom — a confident, ungrounded
 * answer.
 */
export function RagRetrievalDetail() {
  const W = 792;
  const H = 216;
  const boxW = 136;
  const boxH = 72;
  const y = 40;
  const xs = centeredRow(0, W, RETRIEVAL_STEPS.length, boxW, 24);

  return (
    <DiagramFrame
      eyebrow="Inside the retrieval step"
      note="Bad retrieval gives an ungrounded answer; a missing chunk gives a confident hallucination. Both look identical from the outside, which is why the failure mode has to be found here rather than in the model."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Inside the retrieval step"
        desc="A question is embedded with the same model used at index time, the nearest k chunks are found by cosine similarity, an optional reranker reorders them, and what survives becomes the context window the model actually sees."
      >
        {RETRIEVAL_STEPS.slice(0, -1).map((step, i) => (
          <Connector
            key={step.label}
            from={[xs[i] + boxW, y + boxH / 2]}
            to={[xs[i + 1], y + boxH / 2]}
            route="straight"
          />
        ))}
        {RETRIEVAL_STEPS.map((step, i) => (
          <Node
            key={step.label}
            x={xs[i]}
            y={y}
            width={boxW}
            height={boxH}
            variant={step.variant}
            label={step.label}
            sublabel={step.sub}
          />
        ))}

        <SvgText
          x={xs[2] + boxW / 2}
          y={y + boxH + 32}
          width={boxW + 48}
          variant="sub"
          tone="muted"
        >
          k too small drops the answer
        </SvgText>
        <SvgText
          x={W - 16}
          y={y + boxH + 32}
          width={boxW + 48}
          variant="sub"
          tone="muted"
          textAnchor="end"
        >
          anything not here does not exist
        </SvgText>

        <Legend
          y={H - 12}
          width={W}
          x={16}
          items={[
            { kind: 'focal', label: 'All the model ever sees' },
            { kind: 'optional', label: 'Optional, and usually worth it' },
          ]}
          pitch={320}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 20.2 — CnnFeatureHierarchy                                           */
/* ------------------------------------------------------------------ */

const CNN_LAYERS = [
  { tag: 'TOP', name: 'Objects and scenes', sub: 'car · cat · espresso bar', note: 'top layer' },
  { tag: 'L3', name: 'Object parts', sub: 'wheel · eye · leaf', note: 'deep layers' },
  { tag: 'L2', name: 'Textures', sub: 'fur · brick · wood', note: 'mid layers' },
  { tag: 'L1', name: 'Edges', sub: 'orientation and contrast', note: 'first conv layers' },
  { tag: 'IN', name: 'Pixels', sub: '256 x 256 x 3', note: 'raw image' },
];

export function CnnFeatureHierarchy() {
  const W = 792;
  const rowH = 60;
  const H = rowH * CNN_LAYERS.length + 40;

  return (
    <DiagramFrame
      eyebrow="What a CNN actually learns"
      note="No human told the model what an edge or a wheel was. The layers emerged from training on labelled images — which is also why a model trained on one domain's images often cannot see another's."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The visual feature hierarchy a CNN learns"
        desc="Five levels from raw pixels at the bottom, through edges, textures, and object parts, to whole objects and scenes at the top. Each level is composed from the one below it, and none of the levels was specified by a human."
      >
        <Layers
          x={48}
          y={16}
          width={W - 72}
          rowHeight={rowH}
          layers={CNN_LAYERS}
          direction="abstraction"
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 20.2 — VisionPipeline                                                */
/* ------------------------------------------------------------------ */

const VISION_OUTPUTS = [
  { label: 'Class label', sub: 'espresso machine', tag: 'CLASSIFY' },
  { label: 'Bounding boxes', sub: 'x, y, w, h per object', tag: 'DETECT' },
  { label: 'Segmentation mask', sub: 'a class per pixel', tag: 'SEGMENT' },
  { label: 'Image embedding', sub: 'a vector for search', tag: 'SIMILARITY' },
];

/**
 * A fan-out, drawn as a bus. The old version ran four dashed diagonals from the
 * model box to four differently-coloured output boxes; the diagonals were the
 * defect and the four colours were the noise — the outputs are alternatives,
 * not categories, so nothing distinguishes them but their names.
 */
export function VisionPipeline() {
  const W = 792;
  const rowH = 56;
  const pitch = 68;
  const top = 20;
  const outX = 424;
  const outW = 344;
  const H = top + pitch * (VISION_OUTPUTS.length - 1) + rowH + 24;
  const centreY = top + (pitch * (VISION_OUTPUTS.length - 1) + rowH) / 2;

  return (
    <DiagramFrame
      eyebrow="One vision model, four output shapes"
      note="The model is the same in all four cases; what changes is the head bolted onto it and the labels it was trained against. Choosing between these is a product decision, not a modelling one."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="Four output shapes from one vision model"
        desc="An image goes into a pretrained and fine-tuned vision model, which can emit a class label, a set of bounding boxes, a per-pixel segmentation mask, or an embedding vector for similarity search."
      >
        <Connector from={[136, centreY]} to={[176, centreY]} route="straight" />
        <TreeBus
          orientation="horizontal"
          parentX={344}
          parentY={centreY}
          childXs={VISION_OUTPUTS.map((_, i) => top + i * pitch + rowH / 2)}
          childY={outX}
        />

        <Node x={16} y={centreY - 32} width={120} height={64} variant="input" label="Image" />
        <Node
          x={176}
          y={centreY - 40}
          width={168}
          height={80}
          variant="focal"
          label="Vision model"
          sublabel="CNN or ViT, pretrained then fine-tuned"
        />

        {VISION_OUTPUTS.map((o, i) => (
          <React.Fragment key={o.label}>
            <Node
              x={outX}
              y={top + i * pitch}
              width={outW}
              height={rowH}
              align="start"
              label={o.label}
              sublabel={o.sub}
            />
            <EyebrowLabel
              x={outX + outW - 12}
              y={top + i * pitch + rowH / 2 + 3}
              anchor="end"
              tone="soft"
              masked={false}
            >
              {o.tag}
            </EyebrowLabel>
          </React.Fragment>
        ))}
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 20.3 — DocumentAIFlow                                                */
/* ------------------------------------------------------------------ */

const DOC_STAGES = [
  { label: 'Scan or PDF', sub: 'invoice, receipt', variant: 'input' as const },
  { label: 'Layout detection', sub: 'tables, headers, line items', variant: 'focal' as const },
  { label: 'OCR', sub: 'pixels to text', variant: 'step' as const },
  { label: 'LLM extraction', sub: 'apply a JSON schema', variant: 'step' as const },
  { label: 'Human review', sub: 'low-confidence rows only', variant: 'boundary' as const },
  { label: 'Downstream', sub: 'GL, ERP, CRM', variant: 'external' as const },
];

export function DocumentAIFlow() {
  const W = 792;
  const H = 200;
  const boxW = 112;
  const boxH = 88;
  const y = 32;
  const xs = centeredRow(0, W, DOC_STAGES.length, boxW, 20);

  return (
    <DiagramFrame
      eyebrow="From a scanned invoice to a GL entry"
      note="Most of the engineering is in stage 2 and stage 5 — finding the layout, and knowing which rows to send to a human. The OCR and the extraction are the parts that come out of a box."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="A document AI pipeline"
        desc="A scanned invoice passes through layout detection, OCR, and schema-driven LLM extraction, then a human reviews the low-confidence rows before the result is written to a downstream finance system."
      >
        {DOC_STAGES.slice(0, -1).map((s, i) => (
          <Connector
            key={s.label}
            from={[xs[i] + boxW, y + boxH / 2]}
            to={[xs[i + 1], y + boxH / 2]}
            route="straight"
          />
        ))}
        {DOC_STAGES.map((s, i) => (
          <React.Fragment key={s.label}>
            <Node
              x={xs[i]}
              y={y}
              width={boxW}
              height={boxH}
              variant={s.variant}
              label={s.label}
              sublabel={s.sub}
            />
            <SvgText x={xs[i] + boxW / 2} y={y - 12} variant="eyebrow" tone="soft">
              {`0${i + 1}`}
            </SvgText>
          </React.Fragment>
        ))}

        <Legend
          y={H - 12}
          width={W}
          x={16}
          items={[
            { kind: 'focal', label: 'Where the engineering actually goes' },
            { kind: 'boundary', label: 'Where a human intervenes' },
          ]}
          pitch={320}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 20.4 — MultimodalArchitecture                                        */
/* ------------------------------------------------------------------ */

const MODALITIES = [
  { label: 'Text', sub: 'reviews, tickets, docs' },
  { label: 'Image', sub: 'shelf, product, ad' },
  { label: 'Audio', sub: 'sales call, podcast' },
  { label: 'Video', sub: 'in-store, ad spot' },
];

const MODAL_TASKS = [
  { label: 'Product image search', sub: 'dark espresso mugs' },
  { label: 'Caption generation', sub: 'image to alt-text' },
  { label: 'Sales-call coaching', sub: 'audio to summary' },
  { label: 'Shelf monitoring', sub: 'video to KPI' },
];

/**
 * Two buses meeting at one box. The old version drew eight diagonals — four in,
 * four out — each at a slightly different angle, which gave the eye eight
 * separate slopes to measure on the way to a claim that is really about one
 * thing: everything lands in the same coordinates.
 */
export function MultimodalArchitecture() {
  const W = 792;
  const rowH = 52;
  const pitch = 64;
  const top = 24;
  const colW = 176;
  const leftX = 16;
  const rightX = W - 16 - colW;
  const H = top + pitch * (MODALITIES.length - 1) + rowH + 24;
  const centreY = top + (pitch * (MODALITIES.length - 1) + rowH) / 2;
  const hubW = 200;
  const hubX = (W - hubW) / 2;

  return (
    <DiagramFrame
      eyebrow="One shared meaning space"
      note="The claim is not that the model handles four kinds of input. It is that all four land in the same coordinates — which is what lets a text query find an image, and an audio clip sit next to the ticket it is about."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="A multimodal model's shared embedding space"
        desc="Text, image, audio, and video are each encoded into one shared embedding space, from which four different applications draw: image search from a text query, caption generation, sales-call coaching, and shelf monitoring."
      >
        <TreeBus
          orientation="horizontal"
          parentX={hubX}
          parentY={centreY}
          childXs={MODALITIES.map((_, i) => top + i * pitch + rowH / 2)}
          childY={leftX + colW}
        />
        <TreeBus
          orientation="horizontal"
          parentX={hubX + hubW}
          parentY={centreY}
          childXs={MODAL_TASKS.map((_, i) => top + i * pitch + rowH / 2)}
          childY={rightX}
        />

        {MODALITIES.map((m, i) => (
          <Node
            key={m.label}
            x={leftX}
            y={top + i * pitch}
            width={colW}
            height={rowH}
            variant="input"
            label={m.label}
            sublabel={m.sub}
          />
        ))}

        <Node
          x={hubX}
          y={centreY - 56}
          width={hubW}
          height={112}
          variant="focal"
          label="Shared embedding space"
          sublabel="text, image, audio, and video in the same coordinates"
        />

        {MODAL_TASKS.map((t, i) => (
          <Node
            key={t.label}
            x={rightX}
            y={top + i * pitch}
            width={colW}
            height={rowH}
            label={t.label}
            sublabel={t.sub}
          />
        ))}

        <EyebrowLabel x={leftX} y={top - 10} anchor="start" tone="soft" masked={false}>
          MODALITIES IN
        </EyebrowLabel>
        <EyebrowLabel x={W - 16} y={top - 10} anchor="end" tone="soft" masked={false}>
          APPLICATIONS OUT
        </EyebrowLabel>
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 21.1 — LlmCapabilityMap                                              */
/* ------------------------------------------------------------------ */

const LLM_CAPABILITIES = [
  { name: 'Summarise', ex: 'summarise this 40-page contract' },
  { name: 'Classify', ex: 'this ticket goes to billing' },
  { name: 'Extract', ex: 'pull the renewal date and parties' },
  { name: 'Translate', ex: 'render this in French' },
  { name: 'Draft', ex: 'reply to this customer' },
  { name: 'Answer', ex: 'answer using these documents' },
  { name: 'Reason and plan', ex: 'propose the next test' },
  { name: 'Narrate', ex: 'explain this chart' },
];

/** Eight peers with no relationship between them: a grid, correctly. */
export function LlmCapabilityMap() {
  return (
    <DiagramFrame
      eyebrow="Eight capabilities, one substrate"
      note="None of these is a chatbot move. They are tasks a manager would have given to an analyst — now available as an API call, which is what changes about the org chart rather than about the model."
      bare
    >
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {LLM_CAPABILITIES.map(c => (
          <div key={c.name} className="rounded-md border border-border bg-card p-2.5">
            <div className="text-[12px] font-semibold text-body">{c.name}</div>
            <div className="mt-1 font-plex text-[10px] leading-snug text-muted">{c.ex}</div>
          </div>
        ))}
      </div>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 21.2 — PromptStructureCard                                           */
/* ------------------------------------------------------------------ */

const PROMPT_SLOTS = [
  { name: 'Role', body: 'You are a customer insights analyst at a specialty coffee chain.' },
  { name: 'Task', body: 'Summarise the main complaints in the following twenty reviews.' },
  {
    name: 'Context',
    body: 'Reviews are from the iOS app, May 2026, after a checkout outage on May 12.',
  },
  {
    name: 'Constraints',
    body: 'Separate product, service, app, and pricing issues. Ignore non-English text. Flag any review verbatim if it threatens regulatory action.',
  },
  { name: 'Examples', body: 'Two labelled example reviews with their target output.' },
  {
    name: 'Output format',
    body: 'Return JSON: topic, evidence_quotes, severity 1-5, suggested_action.',
  },
];

/**
 * Nested: six slots inside one container, because the container is the point.
 * A prompt is not six things you send — it is one brief with six fields, the
 * same brief a manager would hand an analyst.
 */
export function PromptStructureCard() {
  const W = 792;
  // Room for the two-line Constraints slot without its second line running
  // under the eyebrow chip above it.
  const rowH = 56;
  const pitch = 64;
  const top = 44;
  const slotX = 40;
  const slotW = W - 80;
  const H = top + pitch * (PROMPT_SLOTS.length - 1) + rowH + 24;

  return (
    <DiagramFrame
      eyebrow="A prompt is a structured task brief"
      note="Be clear about what you want. The GABRIEL paper shows wording matters less than people fear, once the construct itself is unambiguous — which is a statement about the brief, not about the model."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The six slots of a prompt"
        desc="A prompt holds a role, a task, context, constraints, examples, and an output format — the same six fields a manager would put in a brief for an analyst."
      >
        <Zone x={16} y={16} width={W - 32} height={H - 32} label="ONE BRIEF" />
        {PROMPT_SLOTS.map((slot, i) => (
          <g key={slot.name}>
            <Node
              x={slotX}
              y={top + i * pitch}
              width={slotW}
              height={rowH}
              align="start"
              variant={i === 5 ? 'focal' : 'step'}
              label={slot.body}
              labelDy={6}
            />
            <EyebrowLabel
              x={slotX + 12}
              y={top + i * pitch + 16}
              anchor="start"
              tone={i === 5 ? 'accent' : 'soft'}
              masked={false}
            >
              {slot.name}
            </EyebrowLabel>
          </g>
        ))}
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 21.3 — StructuredOutputFlow                                          */
/* ------------------------------------------------------------------ */

/**
 * A state machine, which is what "the schema is the contract" actually means:
 * output does not flow downstream, it *transitions* — and one of the
 * transitions goes backwards.
 *
 * The previous version was three boxes in a row with the JSON rendered inside
 * `foreignObject`, and it had no failure state at all. The retry edge is the
 * whole argument: output that does not validate gets rejected and re-asked, not
 * silently passed on.
 */
export function StructuredOutputFlow() {
  const W = 792;
  const H = 288;
  const y = 40;
  const boxH = 72;
  const boxW = 152;
  const xs = centeredRow(0, W, 4, boxW, 48);

  return (
    <DiagramFrame
      eyebrow="From messy text to validated JSON"
      note="The schema is the contract. Output that does not validate is rejected and re-asked — not silently passed downstream, where a missing field becomes a null that someone eventually reads as a zero."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The structured-output state machine"
        desc="Free text is parsed against a schema. Valid output is accepted; invalid output returns to the model with the validation error attached and is asked again. After a bounded number of retries the item is routed to a human rather than passed on."
      >
        {[0, 1, 2].map(i => (
          <Connector
            key={i}
            from={[xs[i] + boxW, y + boxH / 2]}
            to={[xs[i + 1], y + boxH / 2]}
            route="straight"
            label={i === 1 ? 'VALIDATE' : undefined}
          />
        ))}

        {/* The transition that makes this a state machine rather than a
            pipeline: invalid output goes back, carrying the error with it. */}
        <Connector
          from={[xs[2] + boxW / 2, y + boxH]}
          to={[xs[1] + boxW / 2, y + boxH]}
          route="vhv"
          mid={y + boxH + 44}
          tone="accent"
          label="INVALID — RETRY"
        />

        {/* And the exit that stops it looping forever. */}
        <Connector
          from={[xs[2] + boxW / 2, y + boxH + 44]}
          to={[xs[3] + boxW / 2, y + boxH + 72]}
          route="vhv"
          mid={y + boxH + 96}
          dashed
          label="AFTER N TRIES"
          // Pulled left off the run's midpoint: the mask would otherwise land
          // inside the node, which paints after it and clips the text.
          labelOffset={-80}
        />

        <Node
          x={xs[0]}
          y={y}
          width={boxW}
          height={boxH}
          variant="input"
          label="Free text"
          sublabel="a note, a review, a call"
        />
        <Node
          x={xs[1]}
          y={y}
          width={boxW}
          height={boxH}
          variant="step"
          tag="LLM"
          label="Generate"
          sublabel="against a schema"
        />
        <Node
          x={xs[2]}
          y={y}
          width={boxW}
          height={boxH}
          variant="focal"
          label="Parse and validate"
          sublabel="the schema is the gate"
        />
        <Node
          x={xs[3]}
          y={y}
          width={boxW}
          height={boxH}
          variant="pos"
          label="Accepted"
          sublabel="typed, safe to store"
        />
        <Node
          x={xs[3]}
          y={y + boxH + 72}
          width={boxW}
          height={48}
          variant="neg"
          label="Sent to a human"
        />

        <Legend
          y={H - 12}
          width={W}
          x={16}
          items={[
            { kind: 'focal', label: 'The gate' },
            { kind: 'pos', label: 'Valid' },
            { kind: 'neg', label: 'Gave up' },
          ]}
          pitch={216}
        />
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 21.4 — AgentWorkflowDiagram                                          */
/* ------------------------------------------------------------------ */

const AGENT_STEPS = [
  { label: 'Pull reviews', sub: 'tool: warehouse', variant: 'step' as const },
  { label: 'Classify and cluster', sub: '§18.4, §19.2', variant: 'step' as const },
  { label: 'Detect what is emerging', sub: 'topic delta', variant: 'step' as const },
  { label: 'Retrieve tickets', sub: 'RAG, §20.1', variant: 'step' as const },
  { label: 'Summarise', sub: 'LLM plus schema', variant: 'step' as const },
  { label: 'Human review', sub: 'the approval gate', variant: 'boundary' as const },
  { label: 'Send and log', sub: 'tool: Slack plus DB', variant: 'step' as const },
];

/**
 * Seven steps, down from eight — "classify" and "embed + cluster" always
 * travelled together, and two nodes that always travel together are one node.
 *
 * The old version had two Bézier curves sweeping across the whole canvas: a row
 * turn from step 4 back to step 5, and a feedback loop that looped under
 * everything and re-entered at the top left. Both are orthogonal now, and the
 * feedback edge is the only accented element, because it is the thing that
 * makes this an agent rather than a script.
 */
export function AgentWorkflowDiagram() {
  const W = 792;
  const rowH = 64;
  const pitch = 76;
  const top = 40;
  const boxX = 176;
  const boxW = 440;
  const H = top + pitch * (AGENT_STEPS.length - 1) + rowH + 56;

  return (
    <DiagramFrame
      eyebrow="A customer-insights agent"
      note="What the agent did on the last run — which alerts a human approved, which they edited, which they killed — is the signal for the next one. Remove that edge and this is a scheduled script with a language model in it."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="A customer-insights agent's control loop"
        desc="Seven steps run in order: pull reviews, classify and cluster them, detect emerging topics, retrieve related tickets, summarise, pass the summary to a human for approval, and send the alert. What the human approved or rejected feeds back into the next run."
      >
        <Zone x={112} y={16} width={W - 176} height={H - 48} label="CONTROL LOOP" boundary={false} />

        {AGENT_STEPS.slice(0, -1).map((s, i) => (
          <Connector
            key={s.label}
            from={[boxX + boxW / 2, top + i * pitch + rowH]}
            to={[boxX + boxW / 2, top + (i + 1) * pitch]}
            route="straight"
          />
        ))}

        {/* Feedback, routed down the left gutter — the only accented edge. */}
        <Connector
          from={[boxX, top + (AGENT_STEPS.length - 1) * pitch + rowH / 2]}
          to={[boxX, top + rowH / 2]}
          route="hvh"
          mid={144}
          tone="accent"
          dashed
          label="NEXT RUN"
          // Left of the run, not right: to the right it lands inside the step
          // column, and the steps paint after the label.
          labelSide="left"
        />

        {AGENT_STEPS.map((s, i) => (
          <React.Fragment key={s.label}>
            <Node
              x={boxX}
              y={top + i * pitch}
              width={boxW}
              height={rowH}
              align="start"
              variant={s.variant}
              label={s.label}
              sublabel={s.sub}
            />
            <SvgText
              x={boxX + boxW - 16}
              y={top + i * pitch + rowH / 2 + 4}
              variant="sub"
              tone="soft"
              textAnchor="end"
            >
              {`0${i + 1}`}
            </SvgText>
          </React.Fragment>
        ))}
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 21.4 — HumanApprovalGate                                             */
/* ------------------------------------------------------------------ */

const GATE_BRANCHES = [
  { label: 'Approve', sub: 'sent verbatim', variant: 'pos' as const, edge: 'AS IS' },
  { label: 'Edit and approve', sub: 'sent with changes', variant: 'step' as const, edge: 'EDITED' },
  { label: 'Reject', sub: 'logged, nothing sent', variant: 'neg' as const, edge: 'KILLED' },
];

export function HumanApprovalGate() {
  const W = 792;
  const H = 288;
  const gateX = 264;
  const gateW = 176;
  const gateH = 112;
  const gateY = 88;
  const outX = 552;
  const outW = 224;
  const outH = 56;
  const outY = [24, 116, 208];

  return (
    <DiagramFrame
      eyebrow="The human-approval gate"
      note="Every approved, edited, or rejected decision becomes training data for the next iteration. A gate that only ever says yes is a rubber stamp; a gate whose edits are never captured is a wasted signal."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The human-approval gate"
        desc="An agent's proposed action reaches a human reviewer, who can approve it as it stands, edit it and approve, or reject it. All three outcomes are logged, and all three feed the next iteration."
      >
        <Connector
          from={[192, gateY + gateH / 2]}
          to={[gateX, gateY + gateH / 2]}
          route="straight"
        />
        {GATE_BRANCHES.map((b, i) => (
          <Connector
            key={b.label}
            from={[gateX + gateW, gateY + gateH / 2]}
            to={[outX, outY[i] + outH / 2]}
            route="hvh"
            mid={472 + i * 12}
            label={b.edge}
            labelSide={i === 1 ? 'above' : 'right'}
          />
        ))}

        <Node
          x={16}
          y={gateY + gateH / 2 - 36}
          width={176}
          height={72}
          variant="input"
          label="Agent proposal"
          sublabel="send this Slack alert"
        />
        <Node
          x={gateX}
          y={gateY}
          width={gateW}
          height={gateH}
          shape="diamond"
          variant="focal"
          label="A human reviews"
        />
        {GATE_BRANCHES.map((b, i) => (
          <Node
            key={b.label}
            x={outX}
            y={outY[i]}
            width={outW}
            height={outH}
            variant={b.variant}
            label={b.label}
            sublabel={b.sub}
          />
        ))}
      </DiagramSvg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 22.2 — CustomerVoiceStudioFlow                                       */
/* ------------------------------------------------------------------ */

const STUDIO_STAGES = [
  { label: 'Classify', sub: 'route and tag · §18.4' },
  { label: 'Measure', sub: 'constructs · §19.3' },
  { label: 'Cluster', sub: 'embed · §19.2' },
  { label: 'Retrieve', sub: 'RAG · §20.1' },
  { label: 'Summarise and act', sub: 'agent · §21.4' },
  { label: 'Monitor', sub: 'governance · §22.1', focal: true },
];

export function CustomerVoiceStudioFlow() {
  const W = 792;
  const H = 224;
  const boxW = 112;
  const boxH = 80;
  const y = 32;
  const xs = centeredRow(0, W, STUDIO_STAGES.length, boxW, 20);

  return (
    <DiagramFrame
      eyebrow="The Part V loop, end to end"
      note="Monitoring is not the last step; it is the step that rewrites the first three. What the studio learns in production becomes the revised classify, measure, and cluster definitions of the next cycle."
    >
      <DiagramSvg
        width={W}
        height={H}
        title="The Customer Voice Intelligence Studio loop"
        desc="Six stages run in order — classify, measure, cluster, retrieve, summarise and act, monitor — and monitoring feeds revised definitions back into the first three stages for the next cycle."
      >
        {STUDIO_STAGES.slice(0, -1).map((s, i) => (
          <Connector
            key={s.label}
            from={[xs[i] + boxW, y + boxH / 2]}
            to={[xs[i + 1], y + boxH / 2]}
            route="straight"
          />
        ))}

        <Connector
          from={[xs[5] + boxW / 2, y + boxH]}
          to={[xs[0] + boxW / 2, y + boxH]}
          route="vhv"
          mid={y + boxH + 48}
          tone="accent"
          dashed
          label="REVISED DEFINITIONS"
        />

        {STUDIO_STAGES.map((s, i) => (
          <Node
            key={s.label}
            x={xs[i]}
            y={y}
            width={boxW}
            height={boxH}
            variant={s.focal ? 'focal' : 'step'}
            label={s.label}
            sublabel={s.sub}
          />
        ))}
      </DiagramSvg>
    </DiagramFrame>
  );
}
