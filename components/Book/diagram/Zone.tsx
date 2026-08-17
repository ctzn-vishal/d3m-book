import * as React from 'react';

import { EyebrowLabel } from './ArrowLabel';
import { SvgText } from './text';
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

/**
 * A swimlane: a full-width band with its name in a left gutter.
 *
 * Different from `Zone` in the one way that matters — the label lives *beside*
 * the band rather than inside it, so the lane's whole height is usable and two
 * lanes stacked read as parallel tracks rather than as nested containers.
 *
 * Five lanes is the ceiling. Past that the reader is doing a lookup, not
 * reading a process.
 */
export function Lane({
  x,
  y,
  width,
  height,
  label,
  sublabel,
  gutter = 96,
  children,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  sublabel?: string;
  /** Width of the name column to the left of the band. */
  gutter?: number;
  children?: React.ReactNode;
}) {
  return (
    <g>
      <rect
        x={x + gutter}
        y={y}
        width={width - gutter}
        height={height}
        rx={R.md}
        fill={T.paperAlt}
        fillOpacity={0.5}
        stroke={T.rule}
        strokeWidth={S.thin}
      />
      <SvgText
        x={x + gutter - 12}
        y={y + height / 2 + (sublabel ? -2 : 4)}
        width={gutter - 16}
        anchorY="middle"
        variant="nodeSm"
        tone="muted"
        textAnchor="end"
      >
        {label}
      </SvgText>
      {sublabel && (
        <SvgText
          x={x + gutter - 12}
          y={y + height / 2 + 14}
          width={gutter - 16}
          variant="sub"
          tone="soft"
          textAnchor="end"
        >
          {sublabel}
        </SvgText>
      )}
      {children}
    </g>
  );
}
