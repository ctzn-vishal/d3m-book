'use client';

import * as React from 'react';

import { SvgText } from './text';
import { R, S, T, toneStroke, type Tone } from './tokens';
import type { NodeVariant } from './Node';

/**
 * The legend, as a horizontal strip along the bottom of the SVG.
 *
 * Never floating inside the diagram area — it collides with nodes, and a
 * reader who needs the legend is by definition already lost. A hairline
 * separates it from the drawing; budget ~48px of extra `viewBox` height for it.
 *
 * A legend that explains a variant the diagram doesn't use is worse than no
 * legend, and so is one that explains a variant whose meaning is already
 * obvious from the label. If every node in a diagram is a `step`, skip it.
 */

export type SwatchKind = NodeVariant | 'arrow' | 'arrow-dashed' | 'arrow-accent';

export interface LegendItem {
  kind: SwatchKind;
  label: string;
}

export interface LegendProps {
  /** Baseline for the strip — the hairline sits 8px above this. */
  y: number;
  /** Inner width available, usually the viewBox width. */
  width: number;
  /** Left inset. Match the diagram's own margin. */
  x?: number;
  items: LegendItem[];
  /** Column pitch. Widen it when labels are long enough to collide. */
  pitch?: number;
}

const NODE_SWATCH: Partial<Record<NodeVariant, { fill: string; stroke: string; dash?: string }>> = {
  focal: { fill: T.accentTint, stroke: T.accent },
  step: { fill: T.paper, stroke: T.ink },
  store: { fill: T.paperAlt, stroke: T.muted },
  external: { fill: T.ground, stroke: T.ruleStrong },
  input: { fill: T.paperAlt, stroke: T.ruleStrong },
  optional: { fill: T.paper, stroke: T.ruleStrong, dash: '3 2' },
  boundary: { fill: T.accentTint, stroke: T.accent, dash: '3 3' },
  pos: { fill: T.posTint, stroke: T.pos },
  neg: { fill: T.negTint, stroke: T.neg },
};

function Swatch({ kind, x, y }: { kind: SwatchKind; x: number; y: number }) {
  if (kind === 'arrow' || kind === 'arrow-dashed' || kind === 'arrow-accent') {
    const tone: Tone = kind === 'arrow-accent' ? 'accent' : 'default';
    return (
      <line
        x1={x}
        y1={y}
        x2={x + 16}
        y2={y}
        stroke={toneStroke[tone]}
        strokeWidth={S.strong}
        strokeDasharray={kind === 'arrow-dashed' ? '3 2' : undefined}
      />
    );
  }
  const s = NODE_SWATCH[kind] ?? NODE_SWATCH.step!;
  return (
    <rect
      x={x}
      y={y - 5}
      width={16}
      height={10}
      rx={R.sm - 1}
      fill={s.fill}
      stroke={s.stroke}
      strokeWidth={S.thin}
      strokeDasharray={s.dash}
    />
  );
}

export function Legend({ y, width, x = 0, items, pitch }: LegendProps) {
  // "LEGEND" itself takes the first slot; items start after it.
  const start = x + 72;
  const step = pitch ?? Math.max(120, Math.floor((width - start - x) / Math.max(1, items.length)));

  return (
    <g>
      <line x1={x} y1={y - 12} x2={width - x} y2={y - 12} stroke={T.rule} strokeWidth={S.thin} />
      <SvgText x={x} y={y + 3} variant="eyebrow" tone="soft" textAnchor="start">
        LEGEND
      </SvgText>
      {items.map((item, i) => (
        <g key={item.label}>
          <Swatch kind={item.kind} x={start + i * step} y={y} />
          <SvgText
            x={start + i * step + 24}
            y={y + 3}
            variant="sub"
            tone="muted"
            textAnchor="start"
          >
            {item.label}
          </SvgText>
        </g>
      ))}
    </g>
  );
}
