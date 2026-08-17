import * as React from 'react';

import { SvgText, lineCount } from './text';
import { R, S, T } from './tokens';

/** Line heights for the two text rows inside a node. Mirrors text.tsx. */
const NAME_LH = 14;
const SUB_LH = 11;
/** Space between the name block and the sublabel block. */
const BLOCK_GAP = 5;

/**
 * A box in a schematic.
 *
 * The variant is the whole point. Before this kit, every node in the book was
 * an identical rounded rect distinguished only by fill colour drawn from a
 * ten-hue palette — which meant colour carried *category*, not *emphasis*, and
 * nothing in any diagram was focal. `ConfounderDAG` gave three nodes three
 * different colours; `JoinModelDiagram` gave five entities five.
 *
 * Here, colour carries exactly one message — "look here first" — and shape and
 * fill weight carry the rest. Pick the variant that describes what the node
 * *is*, and let at most two nodes per diagram be `focal`.
 */

export type NodeVariant =
  /** The 1–2 nodes the reader should land on first. Accent border and wash. */
  | 'focal'
  /** A step, service, or process. The default. */
  | 'step'
  /** A table, index, file, or anything that holds state. */
  | 'store'
  /** A system outside the boundary — a vendor, an API, someone else's problem. */
  | 'external'
  /** A human, an event, or raw material entering the diagram. */
  | 'input'
  /** Optional, async, or conditional. Dashed. */
  | 'optional'
  /** A trust or governance boundary. Dashed accent. */
  | 'boundary'
  /** Semantic: the supported / passing / controlled side. */
  | 'pos'
  /** Semantic: the unsupported / failing / uncontrolled side. */
  | 'neg';

interface Treatment {
  fill: string;
  stroke: string;
  strokeWidth: number;
  dash?: string;
  /** Tone for the node's own name. */
  tone: 'ink' | 'accent' | 'pos' | 'neg' | 'muted';
}

/**
 * Fills come from `paper`/`paperAlt`, not from `ink @ α`.
 *
 * The skill's default table says `store: ink @ 0.05`, which only works when ink
 * is permanently near-black. Ink inverts here, so an ink wash would be pale in
 * light mode and *bright* in dark — the store node would end up louder than the
 * step node it's meant to sit behind. The theme tokens already encode the right
 * ordering, so we use them directly.
 */
const TREATMENT: Record<NodeVariant, Treatment> = {
  focal: { fill: T.accentTint, stroke: T.accent, strokeWidth: S.strong, tone: 'accent' },
  step: { fill: T.paper, stroke: T.ink, strokeWidth: S.base, tone: 'ink' },
  store: { fill: T.paperAlt, stroke: T.muted, strokeWidth: S.base, tone: 'ink' },
  external: { fill: T.ground, stroke: T.ruleStrong, strokeWidth: S.thin, tone: 'muted' },
  input: { fill: T.paperAlt, stroke: T.ruleStrong, strokeWidth: S.base, tone: 'ink' },
  optional: {
    fill: T.paper,
    stroke: T.ruleStrong,
    strokeWidth: S.base,
    dash: '4 3',
    tone: 'muted',
  },
  boundary: {
    fill: T.accentTint,
    stroke: T.accent,
    strokeWidth: S.base,
    dash: '4 4',
    tone: 'accent',
  },
  pos: { fill: T.posTint, stroke: T.pos, strokeWidth: S.base, tone: 'pos' },
  neg: { fill: T.negTint, stroke: T.neg, strokeWidth: S.base, tone: 'neg' },
};

/**
 * Shape carries *type*; colour carries emphasis. That division is what lets a
 * flowchart stay legible in one hue — a diamond is a decision whether or not
 * it's the focal one.
 */
export type NodeShape =
  /** Step, service, entity. The default. */
  | 'rect'
  /** Decision. ≤3 exits, and every outgoing arrow labelled. */
  | 'diamond'
  /** Start or end of a flow. */
  | 'oval';

export interface NodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  variant?: NodeVariant;
  shape?: NodeShape;
  /** Human-readable name. Inter, not mono — this is a name, not a port. */
  label: string;
  /** Technical detail under the name: a field type, a count, a unit, a table. */
  sublabel?: string;
  /**
   * Short uppercase tag in the top-left corner — `API`, `TABLE`, `LLM`. A
   * rectangular chip (rx=2), never a pill. Skip it unless the *kind* of thing
   * is genuinely non-obvious from the name.
   */
  tag?: string;
  rx?: number;
  /**
   * `center` (default) or `start`. Left-align when the box is wide and the
   * label is a sentence rather than a name — centred prose in a 600px box
   * gives the eye a different left edge on every line.
   */
  align?: 'center' | 'start';
  /** Nudge the label block up or down inside the box. */
  labelDy?: number;
  children?: React.ReactNode;
}

/** The node's outline, drawn twice: once opaque as a mask, once styled. */
function Shape({
  shape,
  x,
  y,
  width,
  height,
  rx,
  fill,
  stroke,
  strokeWidth,
  dash,
}: {
  shape: NodeShape;
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
}) {
  const common = { fill, stroke, strokeWidth, strokeDasharray: dash };
  if (shape === 'diamond') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    return (
      <polygon
        points={`${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`}
        {...common}
      />
    );
  }
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={shape === 'oval' ? height / 2 : rx}
      {...common}
    />
  );
}

export function Node({
  x,
  y,
  width,
  height,
  variant = 'step',
  shape = 'rect',
  label,
  sublabel,
  tag,
  rx = R.md,
  align = 'center',
  labelDy = 0,
  children,
}: NodeProps) {
  const t = TREATMENT[variant];
  const cx = align === 'start' ? x + 12 : x + width / 2;
  // A diamond's usable text width is roughly half its box at mid-height.
  const padded = shape === 'diamond' ? width * 0.62 : width - (align === 'start' ? 24 : 20);
  const textAnchor = align === 'start' ? 'start' : 'middle';

  // Lay the name and sublabel out as one block, measured.
  //
  // The obvious version — name centred, sublabel at a fixed +18 — works right
  // up until the name wraps, at which point its second line lands on the
  // sublabel's first. That isn't a rare case: it happens to any label longer
  // than about twenty characters, which is most of them.
  const nameLines = lineCount(label, padded, 'node');
  const subLines = sublabel ? lineCount(sublabel, padded, 'sub') : 0;
  const blockH = nameLines * NAME_LH + (subLines ? BLOCK_GAP + subLines * SUB_LH : 0);
  // The tag chip owns the top-left corner, so the block shifts clear of it.
  const blockTop = y + (height - blockH) / 2 + labelDy + (tag ? 6 : 0);
  const nameY = blockTop + 11;
  const subY = blockTop + nameLines * NAME_LH + BLOCK_GAP + 8;

  return (
    <g>
      {/* Opaque ground first: a tinted fill alone would let a connector
          routed behind the node show through it. */}
      <Shape
        shape={shape}
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        fill={T.ground}
      />
      <Shape
        shape={shape}
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        fill={t.fill}
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        dash={t.dash}
      />
      {tag && (
        <>
          <rect
            x={x + 8}
            y={y + 6}
            width={Math.max(24, tag.length * 6 + 8)}
            height={12}
            rx={2}
            fill="none"
            stroke={t.stroke}
            strokeOpacity={0.4}
            strokeWidth={S.thin}
          />
          <SvgText
            x={x + 8 + Math.max(24, tag.length * 6 + 8) / 2}
            y={y + 15}
            variant="eyebrow"
            tone={t.tone === 'ink' ? 'muted' : t.tone}
          >
            {tag}
          </SvgText>
        </>
      )}
      <SvgText
        x={cx}
        y={nameY}
        width={padded}
        variant="node"
        tone={t.tone}
        textAnchor={textAnchor}
      >
        {label}
      </SvgText>
      {sublabel && (
        <SvgText
          x={cx}
          y={subY}
          width={padded}
          variant="sub"
          // `muted`, not `soft`: a sublabel sitting on a tinted focal fill has
          // less contrast to work with than one on plain paper, and 9px type
          // has none to spare.
          tone="muted"
          textAnchor={textAnchor}
        >
          {sublabel}
        </SvgText>
      )}
      {children}
    </g>
  );
}

/**
 * The point where two branches of a flowchart rejoin. A small filled dot —
 * not a box, because nothing happens here.
 */
export function MergeDot({ x, y, tone = 'ink' }: { x: number; y: number; tone?: 'ink' | 'accent' }) {
  return <circle cx={x} cy={y} r={4} fill={tone === 'accent' ? T.accent : T.ink} />;
}

/* ------------------------------------------------------------------ */
/* Anchors                                                             */
/* ------------------------------------------------------------------ */

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Edge-point helpers, so connector coordinates are written in terms of the
 * nodes they join rather than as loose numbers that drift when a box moves.
 *
 * The optional `t` is a 0–1 position along the edge — pair it with `fan()` from
 * `path.ts` when several connectors share one side.
 */
export const anchor = {
  left: (b: Box, t = 0.5): [number, number] => [b.x, b.y + b.height * t],
  right: (b: Box, t = 0.5): [number, number] => [b.x + b.width, b.y + b.height * t],
  top: (b: Box, t = 0.5): [number, number] => [b.x + b.width * t, b.y],
  bottom: (b: Box, t = 0.5): [number, number] => [b.x + b.width * t, b.y + b.height],
  center: (b: Box): [number, number] => [b.x + b.width / 2, b.y + b.height / 2],
};
