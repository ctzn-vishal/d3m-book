import * as React from 'react';

import { connectorPath } from './path';
import { S, toneStroke, type Tone } from './tokens';

/**
 * The bus that joins a parent to its children in a tree.
 *
 * Trees are where diagonal connectors creep back in, because a fan of straight
 * lines from one parent to five children *looks* fine at a glance. It isn't:
 * five diagonals at five different angles give the eye five different things to
 * measure. The orthogonal form — one drop, one horizontal bus, one drop per
 * child — gives it one.
 *
 * Drawn without arrowheads. A tree's direction is carried by position; an
 * arrow on every edge is a dozen marks restating what the layout already said.
 */

export interface TreeBusProps {
  /**
   * The point on the parent the bus leaves from — bottom-centre for a
   * top-down tree, right-centre for a left-right router.
   */
  parentX: number;
  parentY: number;
  /**
   * Positions of the children along the axis they're spread on, plus the
   * coordinate of their shared entry edge. Vertical: `childXs` are centres,
   * `childY` is their top edge. Horizontal: `childXs` are centre *y*s and
   * `childY` is their left edge — the names stay put so callers don't have to
   * think about which is which.
   */
  childXs: number[];
  childY: number;
  /**
   * `vertical` (default) — parent above, children below.
   * `horizontal` — parent left, children stacked to the right. Use this for a
   * router: one line out, one spine, one branch per destination. A fan of six
   * separate elbows from one node's edge cannot be routed without crossings
   * unless the gap is wide enough for six parallel runs 12px apart, which it
   * almost never is.
   */
  orientation?: 'vertical' | 'horizontal';
  /** Corner radius where the bus turns into the outermost children. */
  r?: number;
  tone?: Tone;
  dashed?: boolean;
}

export function TreeBus({
  parentX,
  parentY,
  childXs,
  childY,
  orientation = 'vertical',
  r = 8,
  tone = 'default',
  dashed,
}: TreeBusProps) {
  if (childXs.length === 0) return null;

  if (orientation === 'horizontal') {
    return (
      <HorizontalBus
        parentX={parentX}
        parentY={parentY}
        childYs={childXs}
        childX={childY}
        r={r}
        tone={tone}
        dashed={dashed}
      />
    );
  }

  const stroke = toneStroke[tone];
  const common = {
    fill: 'none' as const,
    stroke,
    strokeWidth: S.base,
    strokeDasharray: dashed ? '4 3' : undefined,
    strokeLinecap: 'round' as const,
  };

  // One child needs no bus — it's just a connector, and drawing a one-stop bus
  // for it adds two corners that carry nothing.
  if (childXs.length === 1) {
    return (
      <path d={connectorPath([parentX, parentY], [childXs[0], childY], { route: 'vhv', r })} {...common} />
    );
  }

  // The bus sits midway between the rows. Closer to the children and the drops
  // become stubs; closer to the parent and the bus reads as belonging to the
  // row above it.
  const busY = (parentY + childY) / 2;
  const xs = [...childXs].sort((a, b) => a - b);
  const left = xs[0];
  const right = xs[xs.length - 1];
  const rr = Math.min(r, (right - left) / 2, Math.abs(childY - busY));

  return (
    <g>
      <path d={`M ${parentX},${parentY} V ${busY}`} {...common} />
      {/* One path for the bus and both end drops, so the corners are real
          corners rather than two lines meeting at a point. */}
      <path
        d={
          `M ${left},${childY} V ${busY + rr} Q ${left},${busY} ${left + rr},${busY} ` +
          `H ${right - rr} Q ${right},${busY} ${right},${busY + rr} V ${childY}`
        }
        {...common}
      />
      {xs.slice(1, -1).map(cx => (
        <path key={cx} d={`M ${cx},${busY} V ${childY}`} {...common} />
      ))}
    </g>
  );
}

/** The same shape rotated a quarter turn: parent left, children to the right. */
function HorizontalBus({
  parentX,
  parentY,
  childYs,
  childX,
  r,
  tone,
  dashed,
}: {
  parentX: number;
  parentY: number;
  childYs: number[];
  childX: number;
  r: number;
  tone: Tone;
  dashed?: boolean;
}) {
  const common = {
    fill: 'none' as const,
    stroke: toneStroke[tone],
    strokeWidth: S.base,
    strokeDasharray: dashed ? '4 3' : undefined,
    strokeLinecap: 'round' as const,
  };

  if (childYs.length === 1) {
    return (
      <path d={connectorPath([parentX, parentY], [childX, childYs[0]], { route: 'hvh', r })} {...common} />
    );
  }

  const busX = (parentX + childX) / 2;
  const ys = [...childYs].sort((a, b) => a - b);
  const top = ys[0];
  const bottom = ys[ys.length - 1];
  const rr = Math.min(r, (bottom - top) / 2, Math.abs(childX - busX));

  return (
    <g>
      <path d={`M ${parentX},${parentY} H ${busX}`} {...common} />
      <path
        d={
          `M ${childX},${top} H ${busX + rr} Q ${busX},${top} ${busX},${top + rr} ` +
          `V ${bottom - rr} Q ${busX},${bottom} ${busX + rr},${bottom} H ${childX}`
        }
        {...common}
      />
      {ys.slice(1, -1).map(cy => (
        <path key={cy} d={`M ${busX},${cy} H ${childX}`} {...common} />
      ))}
    </g>
  );
}
