'use client';

import * as React from 'react';

import { Mask } from './DiagramFrame';
import { SvgText } from './text';
import { R, S, T } from './tokens';

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

export interface NodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  variant?: NodeVariant;
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
  /** Nudge the label block up or down inside the box. */
  labelDy?: number;
  children?: React.ReactNode;
}

export function Node({
  x,
  y,
  width,
  height,
  variant = 'step',
  label,
  sublabel,
  tag,
  rx = R.md,
  labelDy = 0,
  children,
}: NodeProps) {
  const t = TREATMENT[variant];
  const cx = x + width / 2;
  // With a sublabel the name lifts so the pair stays optically centred; the
  // tag pushes both down out of the corner chip's way.
  const cy = y + height / 2 + labelDy + (sublabel ? -5 : 0) + (tag ? 5 : 0);
  const padded = width - 20;

  return (
    <g>
      {/* Opaque ground first: a tinted fill alone would let a connector
          routed behind the node show through it. */}
      <Mask x={x} y={y} width={width} height={height} rx={rx} />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        fill={t.fill}
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeDasharray={t.dash}
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
      <SvgText x={cx} y={cy + 4} width={padded} anchorY="middle" variant="node" tone={t.tone}>
        {label}
      </SvgText>
      {sublabel && (
        <SvgText
          x={cx}
          y={cy + 18}
          width={padded}
          variant="sub"
          tone="soft"
          anchorY="middle"
        >
          {sublabel}
        </SvgText>
      )}
      {children}
    </g>
  );
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
