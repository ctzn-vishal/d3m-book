import * as React from 'react';

import { EyebrowLabel } from './ArrowLabel';
import { R, S, T } from './tokens';

/**
 * A container grouping nodes that share a tier, a lane, or a trust boundary.
 *
 * Drawn **before** arrows and nodes — the z-order is ground → zones → arrows →
 * nodes. That ordering is why a label mask may safely overlap a zone (the zone
 * is already painted) but never a node (which paints later and would clip the
 * text into a fragment).
 *
 * Keep it to three zones. Past that the diagram is a swimlane and should be
 * drawn as one, with the lanes doing the work the zone rects are trying to do.
 */

export interface ZoneProps {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Short uppercase name, sitting in the zone's top margin. */
  label?: string;
  /**
   * A trust or governance boundary rather than a plain grouping — dashed
   * accent edge. At most one per diagram; it competes with focal nodes.
   */
  boundary?: boolean;
  children?: React.ReactNode;
}

export function Zone({ x, y, width, height, label, boundary, children }: ZoneProps) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={R.lg}
        // A 2%-ink wash is the skill's value; here it's the card token at low
        // opacity, so it stays a step off the ground in both themes instead of
        // inverting into a bright panel.
        fill={boundary ? T.accentTint : T.paperAlt}
        fillOpacity={boundary ? 1 : 0.6}
        stroke={boundary ? T.accent : T.rule}
        strokeWidth={S.thin}
        strokeDasharray={boundary ? '4 4' : undefined}
      />
      {/* Leave ≥16px between this label and the first enclosed node. */}
      {label && <EyebrowLabel x={x + 12} y={y + 14} tone="soft">{label}</EyebrowLabel>}
      {children}
    </g>
  );
}
