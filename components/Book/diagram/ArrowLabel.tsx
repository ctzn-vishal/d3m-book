'use client';

import * as React from 'react';

import { Mask } from './DiagramFrame';
import { SvgText, textWidth } from './text';
import { CHAR_W } from './tokens';

/**
 * An annotation on a connector, with the mask rect that keeps it readable.
 *
 * Two rules, both of which the book's existing diagrams broke:
 *
 * 1. **Always mask.** Without an opaque rect behind it, the connector runs
 *    straight through the glyphs.
 * 2. **Never touch the line.** The mask must clear the stroke by 6–10px. A
 *    label centred *on* its arrow hides the thing it's annotating — `RagPipeline`
 *    put "top-k retrieve" directly on the diagonal it described, so the reader
 *    lost the connection at exactly the point it was being explained.
 *
 * There's a third, less obvious rule the `side` prop exists to help with: the
 * mask must not overlap a node. Nodes paint after labels, so a mask that lands
 * partly inside a box gets covered by the node fill and the text renders as a
 * fragment sitting on the border. Place the label on a stretch of connector
 * that runs through open canvas.
 */

export type LabelSide = 'above' | 'below' | 'left' | 'right';

/** Clearance between the mask edge and the connector stroke. */
const GAP = 8;
const H = 12;

export interface ArrowLabelProps {
  /** A point on the connector — the label is placed relative to it. */
  x: number;
  y: number;
  side?: LabelSide;
  tone?: 'muted' | 'accent' | 'ink' | 'pos' | 'neg';
  children: string;
}

export function ArrowLabel({ x, y, side = 'above', tone = 'muted', children }: ArrowLabelProps) {
  const w = textWidth(children, CHAR_W.arrow) + 8;

  let mx: number;
  let my: number;
  let tx: number;

  switch (side) {
    case 'above':
      mx = x - w / 2;
      my = y - GAP - H;
      tx = x;
      break;
    case 'below':
      mx = x - w / 2;
      my = y + GAP;
      tx = x;
      break;
    case 'left':
      mx = x - GAP - w;
      my = y - H / 2;
      tx = x - GAP - w / 2;
      break;
    case 'right':
      mx = x + GAP;
      my = y - H / 2;
      tx = x + GAP + w / 2;
      break;
  }

  return (
    <g>
      <Mask x={mx} y={my} width={w} height={H} rx={2} />
      <SvgText x={tx} y={my + 9} variant="arrow" tone={tone}>
        {children}
      </SvgText>
    </g>
  );
}

/**
 * A short uppercase label on its own — a zone eyebrow, an axis end, a phase
 * marker. Same masking behaviour, no connector assumed.
 */
export function EyebrowLabel({
  x,
  y,
  children,
  anchor = 'start',
  tone = 'soft',
  masked = true,
}: {
  x: number;
  y: number;
  children: string;
  anchor?: 'start' | 'middle' | 'end';
  tone?: 'muted' | 'soft' | 'accent' | 'ink';
  masked?: boolean;
}) {
  const w = textWidth(children, CHAR_W.eyebrow) + 8;
  const mx = anchor === 'start' ? x - 4 : anchor === 'end' ? x - w + 4 : x - w / 2;

  return (
    <g>
      {masked && <Mask x={mx} y={y - 9} width={w} height={H} rx={2} />}
      <SvgText x={x} y={y} variant="eyebrow" tone={tone} textAnchor={anchor}>
        {children}
      </SvgText>
    </g>
  );
}
